import NetInfo from "@react-native-community/netinfo";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

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
let _isPulling = false;

async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return !!state.isConnected;
  } catch {
    return false;
  }
}

async function syncFromFirestoreInternal() {
  const db = await getDatabase();

  const usersSnap = await getDocs(collection(firestoreDb, "users"));
  const orangesSnap = await getDocs(collection(firestoreDb, "oranges"));
  const analysisSnap = await getDocs(
    collection(firestoreDb, "analysis_results"),
  );

  const orangeIds: string[] = [];
  const analysisIds: string[] = [];

  await db.execAsync("BEGIN;");
  try {
    const ensureUserRow = async (userId: string) => {
      const existing = await db.getFirstAsync<{ user_id: string }>(
        "SELECT user_id FROM Users WHERE user_id = ?",
        [userId],
      );
      if (existing?.user_id) {
        return;
      }

      const safeId = String(userId);
      await db.runAsync(
        `INSERT INTO Users (user_id, username, full_name, email, phone, avatar)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           username = excluded.username,
           full_name = excluded.full_name,
           email = excluded.email,
           phone = excluded.phone,
           avatar = excluded.avatar`,
        [
          safeId,
          `user_${safeId}`,
          `user_${safeId}`,
          `${safeId}@placeholder.local`,
          null,
          null,
        ],
      );
    };

    for (const docSnap of usersSnap.docs) {
      const data: any = docSnap.data();
      const userId = data.user_id || docSnap.id;
      await db.runAsync(
        `INSERT INTO Users (user_id, username, full_name, email, phone, avatar)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           username = excluded.username,
           full_name = excluded.full_name,
           email = excluded.email,
           phone = excluded.phone,
           avatar = excluded.avatar`,
        [
          userId,
          data.username || `user_${userId}`,
          data.full_name || `user_${userId}`,
          data.email || `${userId}@placeholder.local`,
          data.phone || null,
          data.avatar || null,
        ],
      );
    }

    for (const docSnap of orangesSnap.docs) {
      const data: any = docSnap.data();
      const orangeId = data.orange_id || docSnap.id;
      if (!data.user_id) {
        continue;
      }
      await ensureUserRow(data.user_id);
      orangeIds.push(orangeId);

      const local = await db.getFirstAsync<{ status: string }>(
        "SELECT status FROM Oranges_Data WHERE orange_id = ?",
        [orangeId],
      );
      if (local?.status === "pending") {
        continue;
      }

      await db.runAsync(
        `INSERT INTO Oranges_Data (orange_id, user_id, variety, weight, circle_line, created_at, status, image_uri)
         VALUES (?, ?, ?, ?, ?, ?, 'synced', ?)
         ON CONFLICT(orange_id) DO UPDATE SET
           user_id = excluded.user_id,
           variety = excluded.variety,
           weight = excluded.weight,
           circle_line = excluded.circle_line,
           created_at = excluded.created_at,
           status = excluded.status,
           image_uri = excluded.image_uri`,
        [
          orangeId,
          data.user_id,
          data.variety || "-",
          data.weight ?? 0,
          data.circle_line ?? 0,
          data.created_at || new Date().toISOString(),
          data.image_uri || null,
        ],
      );
    }

    for (const docSnap of analysisSnap.docs) {
      const data: any = docSnap.data();
      const resultId = data.result_id || docSnap.id;
      if (!data.orange_id) {
        continue;
      }
      const hasOrange = await db.getFirstAsync<{ orange_id: string }>(
        "SELECT orange_id FROM Oranges_Data WHERE orange_id = ?",
        [data.orange_id],
      );
      if (!hasOrange?.orange_id) {
        continue;
      }
      analysisIds.push(resultId);

      const local = await db.getFirstAsync<{ status: string }>(
        "SELECT status FROM Analysis_Results WHERE result_id = ?",
        [resultId],
      );
      if (local?.status === "pending") {
        continue;
      }

      await db.runAsync(
        `INSERT INTO Analysis_Results (result_id, orange_id, brix_value, volume, grade, analyzed_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'synced')
         ON CONFLICT(result_id) DO UPDATE SET
           orange_id = excluded.orange_id,
           brix_value = excluded.brix_value,
           volume = excluded.volume,
           grade = excluded.grade,
           analyzed_at = excluded.analyzed_at,
           status = excluded.status`,
        [
          resultId,
          data.orange_id,
          data.brix_value ?? 0,
          data.volume ?? 0,
          data.grade || "-",
          data.analyzed_at || new Date().toISOString(),
        ],
      );
    }

    if (orangeIds.length === 0) {
      await db.runAsync(
        "DELETE FROM Oranges_Data WHERE status = 'synced' AND NOT EXISTS (SELECT 1 FROM Analysis_Results ar WHERE ar.orange_id = Oranges_Data.orange_id AND ar.status = 'pending')",
      );
    } else {
      const placeholders = orangeIds.map(() => "?").join(",");
      await db.runAsync(
        `DELETE FROM Oranges_Data
         WHERE status = 'synced'
           AND orange_id NOT IN (${placeholders})
           AND NOT EXISTS (SELECT 1 FROM Analysis_Results ar WHERE ar.orange_id = Oranges_Data.orange_id AND ar.status = 'pending')`,
        orangeIds,
      );
    }

    if (analysisIds.length === 0) {
      await db.runAsync("DELETE FROM Analysis_Results WHERE status = 'synced'");
    } else {
      const placeholders = analysisIds.map(() => "?").join(",");
      await db.runAsync(
        `DELETE FROM Analysis_Results WHERE status = 'synced' AND result_id NOT IN (${placeholders})`,
        analysisIds,
      );
    }

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

async function isOrangeIdTakenAnywhere(
  db: Awaited<ReturnType<typeof getDatabase>>,
  orangeId: string,
): Promise<boolean> {
  const local = await db.getFirstAsync<{ orange_id: string }>(
    "SELECT orange_id FROM Oranges_Data WHERE orange_id = ?",
    [orangeId],
  );
  if (local?.orange_id) {
    return true;
  }

  try {
    const snapshot = await getDoc(doc(firestoreDb, "oranges", orangeId));
    return snapshot.exists();
  } catch {
    return false;
  }
}

async function resolveUniqueOrangeId(
  db: Awaited<ReturnType<typeof getDatabase>>,
  currentId: string,
): Promise<string> {
  let candidate = currentId;
  let tries = 0;

  while (tries < 50) {
    const taken = await isOrangeIdTakenAnywhere(db, candidate);
    if (!taken) {
      return candidate;
    }

    const numeric = Number.parseInt(candidate, 10);
    if (Number.isNaN(numeric)) {
      candidate = `${currentId}-${tries + 1}`;
    } else {
      candidate = String(numeric + 1);
    }

    tries++;
  }

  return candidate;
}

async function updateOrangeIdLocal(
  db: Awaited<ReturnType<typeof getDatabase>>,
  oldId: string,
  newId: string,
) {
  await db.execAsync("BEGIN;");
  try {
    await db.runAsync(
      "UPDATE Oranges_Data SET orange_id = ? WHERE orange_id = ?",
      [newId, oldId],
    );
    await db.runAsync(
      "UPDATE Analysis_Results SET orange_id = ? WHERE orange_id = ?",
      [newId, oldId],
    );
    await db.runAsync(
      "UPDATE Sync_Queue SET record_id = ? WHERE table_name = 'oranges' AND record_id = ?",
      [newId, oldId],
    );

    const analysisQueue = await db.getAllAsync<SyncQueueItem>(
      "SELECT * FROM Sync_Queue WHERE table_name = 'analysis_results'",
    );
    for (const item of analysisQueue) {
      if (!item.data) {
        continue;
      }
      try {
        const parsed = JSON.parse(item.data);
        if (parsed?.orange_id === oldId) {
          parsed.orange_id = newId;
          await db.runAsync("UPDATE Sync_Queue SET data = ? WHERE id = ?", [
            JSON.stringify(parsed),
            item.id,
          ]);
        }
      } catch {
        // Ignore malformed data
      }
    }

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
}

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
      if (!(await isOnline())) {
        const remaining = await this.getQueueCount();
        return { synced: 0, failed: 0, remaining };
      }

      const db = await getDatabase();
      const items = await db.getAllAsync<SyncQueueItem>(
        "SELECT * FROM Sync_Queue WHERE retry_count < ? ORDER BY id ASC",
        [MAX_RETRIES],
      );

      // ไม่มีอะไรต้อง sync → ยัง pull จาก Firestore เพื่ออัปเดตทุกเครื่องให้เหมือนกัน
      if (items.length === 0) {
        await syncFromFirestoreInternal();
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

      await syncFromFirestoreInternal();

      const remaining = await this.getQueueCount();
      console.log(
        `✅ Sync complete: ${synced} synced, ${failed} failed, ${remaining} remaining`,
      );
      return { synced, failed, remaining };
    } finally {
      _isSyncing = false;
    }
  },

  /** ดึงข้อมูลจาก Firestore มาลง SQLite (ทุกอุปกรณ์ได้ข้อมูลเหมือนกัน) */
  async syncFromFirestore() {
    if (_isPulling) {
      return;
    }
    if (!(await isOnline())) {
      return;
    }

    _isPulling = true;
    try {
      await syncFromFirestoreInternal();
    } finally {
      _isPulling = false;
    }
  },

  /** ดำเนินการ sync 1 item */
  async processSyncItem(item: SyncQueueItem) {
    const collectionName = this.getFirestoreCollection(item.table_name);
    const data = item.data ? JSON.parse(item.data) : {};

    switch (item.operation) {
      case "create":
      case "update": {
        let recordId = item.record_id;

        if (item.table_name === "oranges" && item.operation === "create") {
          const exists = await isOrangeIdTakenAnywhere(
            await getDatabase(),
            recordId,
          );
          if (exists) {
            const db = await getDatabase();
            const uniqueId = await resolveUniqueOrangeId(db, recordId);
            if (uniqueId !== recordId) {
              await updateOrangeIdLocal(db, recordId, uniqueId);
              recordId = uniqueId;
              item.record_id = uniqueId;
              data.orange_id = uniqueId;
            }
          }
        }

        await setDoc(
          doc(firestoreDb, collectionName, recordId),
          {
            ...data,
            status: "synced",
            updated_at: new Date().toISOString(),
          },
          { merge: true },
        );
        break;
      }

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
