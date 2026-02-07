import NetInfo from "@react-native-community/netinfo";
import { deleteDoc, doc, setDoc } from "firebase/firestore";

import { getDatabase } from "./database";
import { db as firestoreDb } from "./firebase";

type SyncQueueItem = {
  id: number;
  table_name: string;
  record_id: string;
  operation: "create" | "update" | "delete";
  data: string | null;
  created_at: string;
  retry_count: number;
  last_error: string | null;
};

const MAX_RETRIES = 5;
let _isSyncing = false;

/**
 * SyncManager - จัดการ sync queue ส่งข้อมูลจาก SQLite ไป Firebase
 * ทำงานแบบ offline-first: บันทึก local ก่อน แล้ว queue sync ไว้
 */
export const syncManager = {
  /** เพิ่ม sync operation เข้า queue */
  async queueSync(
    tableName: string,
    recordId: string,
    operation: "create" | "update" | "delete",
    data?: Record<string, any>,
  ) {
    const db = await getDatabase();

    // ถ้ามี pending operation เดิมของ record เดียวกัน ให้ลบออกก่อน
    // เช่น create แล้ว update → เก็บแค่ create พร้อม data ล่าสุด
    // หรือ create แล้ว delete → ลบทั้ง 2 ออก (ไม่ต้อง sync เลย)
    const existing = await db.getAllAsync<SyncQueueItem>(
      "SELECT * FROM Sync_Queue WHERE table_name = ? AND record_id = ? ORDER BY id ASC",
      [tableName, recordId],
    );

    if (operation === "delete" && existing.length > 0) {
      // ถ้ามี create อยู่ใน queue → data ยังไม่เคยไป Firebase → ลบ queue ทิ้งหมด
      const hasCreate = existing.some((e) => e.operation === "create");
      await db.runAsync(
        "DELETE FROM Sync_Queue WHERE table_name = ? AND record_id = ?",
        [tableName, recordId],
      );

      if (hasCreate) {
        // ไม่ต้อง queue delete เพราะ Firebase ยังไม่มี data นี้
        return;
      }
    } else if (
      (operation === "update" || operation === "create") &&
      existing.length > 0
    ) {
      // อัปเดต data ใน queue เดิม
      const firstOp = existing[0];
      // ถ้า operation แรกคือ create → คง create ไว้ แต่ update data
      const finalOperation =
        firstOp.operation === "create" ? "create" : operation;

      await db.runAsync(
        "DELETE FROM Sync_Queue WHERE table_name = ? AND record_id = ?",
        [tableName, recordId],
      );

      await db.runAsync(
        `INSERT INTO Sync_Queue (table_name, record_id, operation, data)
         VALUES (?, ?, ?, ?)`,
        [
          tableName,
          recordId,
          finalOperation,
          data ? JSON.stringify(data) : null,
        ],
      );
      return;
    }

    await db.runAsync(
      `INSERT INTO Sync_Queue (table_name, record_id, operation, data)
       VALUES (?, ?, ?, ?)`,
      [tableName, recordId, operation, data ? JSON.stringify(data) : null],
    );
  },

  /** ดำเนินการ sync ทุก item ใน queue */
  async processQueue(): Promise<{
    synced: number;
    failed: number;
    remaining: number;
  }> {
    // ป้องกันเรียกซ้อนกัน
    if (_isSyncing) {
      return { synced: 0, failed: 0, remaining: await this.getQueueCount() };
    }
    _isSyncing = true;

    try {
      // ตรวจว่าออนไลน์ก่อน
      try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
          const remaining = await this.getQueueCount();
          return { synced: 0, failed: 0, remaining };
        }
      } catch {
        const remaining = await this.getQueueCount();
        return { synced: 0, failed: 0, remaining };
      }

      const db = await getDatabase();
      const items = await db.getAllAsync<SyncQueueItem>(
        "SELECT * FROM Sync_Queue WHERE retry_count < ? ORDER BY id ASC",
        [MAX_RETRIES],
      );

      // ไม่มีอะไรต้อง sync → return เงียบ ๆ
      if (items.length === 0) {
        return { synced: 0, failed: 0, remaining: 0 };
      }

      let synced = 0;
      let failed = 0;

      for (const item of items) {
        try {
          await this.processSyncItem(item);
          await db.runAsync("DELETE FROM Sync_Queue WHERE id = ?", [item.id]);
          await this.markAsSynced(item.table_name, item.record_id);
          synced++;
        } catch (error: any) {
          failed++;
          await db.runAsync(
            "UPDATE Sync_Queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?",
            [String(error?.message || "Unknown error"), item.id],
          );
          console.log(
            `❌ Sync failed for ${item.table_name}/${item.record_id}:`,
            error,
          );
        }
      }

      const remaining = await this.getQueueCount();
      console.log(
        `✅ Sync complete: ${synced} synced, ${failed} failed, ${remaining} remaining`,
      );
      return { synced, failed, remaining };
    } finally {
      _isSyncing = false;
    }
  },

  /** ดำเนินการ sync 1 item */
  async processSyncItem(item: SyncQueueItem) {
    const collectionName = this.getFirestoreCollection(item.table_name);
    const data = item.data ? JSON.parse(item.data) : {};

    switch (item.operation) {
      case "create":
      case "update":
        await setDoc(
          doc(firestoreDb, collectionName, item.record_id),
          {
            ...data,
            status: "synced",
            updated_at: new Date().toISOString(),
          },
          { merge: true },
        );
        break;

      case "delete":
        await deleteDoc(doc(firestoreDb, collectionName, item.record_id));
        break;
    }
  },

  /** อัปเดต status เป็น synced ใน SQLite */
  async markAsSynced(tableName: string, recordId: string) {
    const db = await getDatabase();

    switch (tableName) {
      case "oranges":
        await db.runAsync(
          "UPDATE Oranges_Data SET status = 'synced' WHERE orange_id = ?",
          [recordId],
        );
        break;
      case "analysis_results":
        await db.runAsync(
          "UPDATE Analysis_Results SET status = 'synced' WHERE result_id = ?",
          [recordId],
        );
        break;
      case "users":
        // Users ไม่มี status column
        break;
    }
  },

  /** แปลงชื่อ table เป็นชื่อ Firestore collection */
  getFirestoreCollection(tableName: string): string {
    const map: Record<string, string> = {
      oranges: "oranges",
      analysis_results: "analysis_results",
      users: "users",
    };
    return map[tableName] || tableName;
  },

  /** นับจำนวน item ที่ยัง pending อยู่ */
  async getQueueCount(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM Sync_Queue WHERE retry_count < ?",
      [MAX_RETRIES],
    );
    return result?.count || 0;
  },

  /** ลบ queue items ที่ retry เกิน limit */
  async cleanupFailedItems() {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM Sync_Queue WHERE retry_count >= ?", [
      MAX_RETRIES,
    ]);
  },
};
