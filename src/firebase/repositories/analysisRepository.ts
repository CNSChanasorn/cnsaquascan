import * as Crypto from "expo-crypto";

import { getDatabase } from "../database";
import { syncManager } from "../SyncManager";

/**
 * analysisRepository - Offline-first
 * ทุก operation บันทึกลง SQLite ก่อน แล้ว queue sync ไป Firebase
 */
export const analysisRepository = {
  async addAnalysisResult(
    orangeId: string,
    brixValue: number,
    volume: number,
    grade: string,
  ) {
    const db = await getDatabase();
    const resultId = Crypto.randomUUID();
    const analyzedAt = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO Analysis_Results (result_id, orange_id, brix_value, volume, grade, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [resultId, orangeId, brixValue, volume, grade],
    );

    // Queue sync to Firebase
    await syncManager.queueSync("analysis_results", resultId, "create", {
      result_id: resultId,
      orange_id: orangeId,
      brix_value: brixValue,
      volume,
      grade,
      analyzed_at: analyzedAt,
    });

    void syncManager.processQueue();

    return resultId;
  },

  async getAnalysisByOrange(orangeId: string) {
    const db = await getDatabase();
    return await db.getFirstAsync(
      "SELECT * FROM Analysis_Results WHERE orange_id = ?",
      [orangeId],
    );
  },

  async getAllAnalysis(userId: string) {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT ar.*, od.variety, od.weight, od.circle_line, od.image_uri 
       FROM Analysis_Results ar
       JOIN Oranges_Data od ON ar.orange_id = od.orange_id
       WHERE od.user_id = ? 
       ORDER BY ar.analyzed_at DESC`,
      [userId],
    );
  },

  async getAllAnalysisResults() {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT ar.*, od.variety, od.weight, od.circle_line, od.image_uri 
       FROM Analysis_Results ar
       LEFT JOIN Oranges_Data od ON ar.orange_id = od.orange_id
       ORDER BY ar.analyzed_at DESC`,
    );
  },

  async updateAnalysisStatus(resultId: string, status: string) {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE Analysis_Results SET status = ? WHERE result_id = ?",
      [status, resultId],
    );
  },

  async deleteAnalysis(resultId: string) {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM Analysis_Results WHERE result_id = ?", [
      resultId,
    ]);

    // Queue delete sync
    await syncManager.queueSync("analysis_results", resultId, "delete");

    void syncManager.processQueue();
  },

  /** Sync pending items ทั้งหมด */
  async syncPendingAnalysis() {
    await syncManager.processQueue();
  },
};
