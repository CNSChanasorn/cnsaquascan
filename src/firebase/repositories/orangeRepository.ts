import * as Crypto from "expo-crypto";

import { getDatabase } from "../database";
import { syncManager } from "../SyncManager";

/**
 * orangeRepository - Offline-first
 * ทุก operation บันทึกลง SQLite ก่อน แล้ว queue sync ไป Firebase
 */
export const orangeRepository = {
  async addOrange(
    userId: string,
    variety: string,
    weight: number,
    circleLine: number,
    createdAt?: string,
    orangeIdOverride?: string,
    imageUri?: string,
  ) {
    const db = await getDatabase();
    const orangeId = orangeIdOverride || Crypto.randomUUID();
    const finalCreatedAt = createdAt || new Date().toISOString();

    if (createdAt) {
      await db.runAsync(
        `INSERT INTO Oranges_Data (orange_id, user_id, variety, weight, circle_line, created_at, status, image_uri)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          orangeId,
          userId,
          variety,
          weight,
          circleLine,
          createdAt,
          imageUri || null,
        ],
      );
    } else {
      await db.runAsync(
        `INSERT INTO Oranges_Data (orange_id, user_id, variety, weight, circle_line, status, image_uri)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [orangeId, userId, variety, weight, circleLine, imageUri || null],
      );
    }

    // Queue sync to Firebase
    await syncManager.queueSync("oranges", orangeId, "create", {
      orange_id: orangeId,
      user_id: userId,
      variety,
      weight,
      circle_line: circleLine,
      created_at: finalCreatedAt,
      image_uri: imageUri || null,
    });

    // พยายาม sync ทันที (ถ้าออนไลน์)
    void syncManager.processQueue();

    return orangeId;
  },

  async getOrangesByUser(userId: string) {
    const db = await getDatabase();
    return await db.getAllAsync(
      "SELECT * FROM Oranges_Data WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
  },

  async getAllOranges() {
    const db = await getDatabase();
    return await db.getAllAsync(
      "SELECT * FROM Oranges_Data ORDER BY created_at DESC",
    );
  },

  async getOrangeById(orangeId: string) {
    const db = await getDatabase();
    return await db.getFirstAsync(
      "SELECT * FROM Oranges_Data WHERE orange_id = ?",
      [orangeId],
    );
  },

  async updateOrange(
    orangeId: string,
    variety: string,
    weight: number,
    circleLine: number,
    createdAt?: string,
    imageUri?: string,
    status: "pending" | "synced" = "pending",
  ) {
    const db = await getDatabase();

    if (createdAt) {
      await db.runAsync(
        `UPDATE Oranges_Data
         SET variety = ?, weight = ?, circle_line = ?, created_at = ?, image_uri = ?, status = ?
         WHERE orange_id = ?`,
        [
          variety,
          weight,
          circleLine,
          createdAt,
          imageUri || null,
          "pending",
          orangeId,
        ],
      );
    } else {
      await db.runAsync(
        `UPDATE Oranges_Data
         SET variety = ?, weight = ?, circle_line = ?, image_uri = ?, status = ?
         WHERE orange_id = ?`,
        [variety, weight, circleLine, imageUri || null, "pending", orangeId],
      );
    }

    // Get current data for sync
    const row: any = await this.getOrangeById(orangeId);
    if (row) {
      await syncManager.queueSync("oranges", orangeId, "update", {
        orange_id: orangeId,
        user_id: row.user_id,
        variety,
        weight,
        circle_line: circleLine,
        created_at: createdAt || row.created_at,
        image_uri: imageUri || row.image_uri || null,
      });
    }

    void syncManager.processQueue();
  },

  async updateOrangeStatus(orangeId: string, status: string) {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE Oranges_Data SET status = ? WHERE orange_id = ?",
      [status, orangeId],
    );
  },

  async deleteOrange(orangeId: string) {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM Oranges_Data WHERE orange_id = ?", [
      orangeId,
    ]);

    // Queue delete sync
    await syncManager.queueSync("oranges", orangeId, "delete");

    void syncManager.processQueue();
  },

  /** Sync pending items ทั้งหมด (เรียกตอน app เปิด หรือกลับมาออนไลน์) */
  async syncPendingOranges() {
    await syncManager.processQueue();
  },
};
