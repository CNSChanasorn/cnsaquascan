import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { getDatabase } from "../database";
import { db as firestoreDb } from "../firebase";

export const analysisRepository = {
  async addAnalysisResult(
    orangeId: string,
    brixValue: number,
    volume: number,
    grade: string,
  ) {
    const db = await getDatabase();
    const resultId = Crypto.randomUUID();

    await db.runAsync(
      `INSERT INTO Analysis_Results (result_id, orange_id, brix_value, volume, grade, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [resultId, orangeId, brixValue, volume, grade],
    );

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
    const localRows = await db.getAllAsync(
      `SELECT ar.*, od.variety, od.weight, od.circle_line, od.image_uri 
       FROM Analysis_Results ar
       LEFT JOIN Oranges_Data od ON ar.orange_id = od.orange_id
       ORDER BY ar.analyzed_at DESC`,
    );

    const normalizeAnalyzedAt = (value: any) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (value?.toDate) {
        return value.toDate().toISOString();
      }
      const time = new Date(value).getTime();
      if (Number.isNaN(time)) return null;
      return new Date(time).toISOString();
    };

    const sortByAnalyzedAtDesc = (rows: any[]) =>
      rows.sort((a, b) => {
        const aTime = new Date(a.analyzed_at || 0).getTime();
        const bTime = new Date(b.analyzed_at || 0).getTime();
        return bTime - aTime;
      });

    const mapDocs = (docs: any[]) =>
      docs.map((docSnap) => {
        const data = docSnap.data();
        const analyzedAt = normalizeAnalyzedAt(data.analyzed_at);
        return {
          result_id: data.result_id || docSnap.id,
          ...data,
          analyzed_at: analyzedAt || data.analyzed_at || null,
        };
      });

    const fetchRemoteRows = async () => {
      const { query, collection, orderBy, getDocs } =
        await import("firebase/firestore");
      const orderedQuery = query(
        collection(firestoreDb, "analysis_results"),
        orderBy("analyzed_at", "desc"),
      );
      const snapshot = await getDocs(orderedQuery);
      return mapDocs(snapshot.docs);
    };

    const fetchRemoteRowsNoOrder = async () => {
      const { query, collection, getDocs } = await import("firebase/firestore");
      const simpleQuery = query(collection(firestoreDb, "analysis_results"));
      const snapshot = await getDocs(simpleQuery);
      return mapDocs(snapshot.docs);
    };

    const fetchAndMergeRemote = async () => {
      let remoteRows: any[] = [];

      try {
        remoteRows = await fetchRemoteRows();
      } catch (error: any) {
        const message = String(error?.message || "");
        if (message.includes("requires an index")) {
          remoteRows = await fetchRemoteRowsNoOrder();
        } else {
          throw error;
        }
      }

      sortByAnalyzedAtDesc(remoteRows);

      if (remoteRows.length === 0) {
        return localRows;
      }

      await db.execAsync("BEGIN TRANSACTION;");
      try {
        for (const row of remoteRows) {
          await db.runAsync(
            `INSERT OR REPLACE INTO Analysis_Results 
             (result_id, orange_id, brix_value, volume, grade, analyzed_at, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              row.result_id,
              row.orange_id || "unknown",
              row.brix_value || 0,
              row.volume || 0,
              row.grade || "-",
              row.analyzed_at || new Date().toISOString(),
              row.status || "pending",
            ],
          );
        }
        await db.execAsync("COMMIT;");
      } catch (err) {
        await db.execAsync("ROLLBACK;");
        throw err;
      }

      const mergedRows = await db.getAllAsync(
        `SELECT ar.*, od.variety, od.weight, od.circle_line, od.image_uri 
         FROM Analysis_Results ar
         LEFT JOIN Oranges_Data od ON ar.orange_id = od.orange_id
         ORDER BY ar.analyzed_at DESC`,
      );

      return mergedRows;
    };

    const isOnline = async () => {
      try {
        const state = await NetInfo.fetch();
        return Boolean(state.isConnected);
      } catch {
        return false;
      }
    };

    if (localRows.length > 0) {
      void (async () => {
        if (await isOnline()) {
          try {
            await fetchAndMergeRemote();
          } catch (error) {
            console.log(
              "Firestore fetch failed (getAllAnalysisResults):",
              error,
            );
          }
        }
      })();

      return localRows;
    }

    try {
      if (await isOnline()) {
        return await fetchAndMergeRemote();
      }
      return localRows;
    } catch (error) {
      console.log("Firestore fetch failed (getAllAnalysisResults):", error);
      return localRows;
    }
  },

  async updateAnalysisStatus(resultId: string, status: string) {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE Analysis_Results SET status = ? WHERE result_id = ?",
      [status, resultId],
    );

    try {
      await setDoc(
        doc(firestoreDb, "analysis_results", resultId),
        {
          status,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.log("Firestore sync failed (updateAnalysisStatus):", error);
    }
  },

  async syncPendingAnalysis() {
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) return;
    } catch {
      return;
    }

    const db = await getDatabase();
    const pendingRows: any[] = await db.getAllAsync(
      "SELECT * FROM Analysis_Results WHERE status = 'pending'",
    );

    if (pendingRows.length === 0) return;

    for (const row of pendingRows) {
      try {
        await setDoc(
          doc(firestoreDb, "analysis_results", row.result_id),
          {
            result_id: row.result_id,
            orange_id: row.orange_id,
            brix_value: row.brix_value,
            volume: row.volume,
            grade: row.grade,
            analyzed_at: row.analyzed_at || new Date().toISOString(),
            status: "synced",
            updated_at: new Date().toISOString(),
          },
          { merge: true },
        );

        await this.updateAnalysisStatus(row.result_id, "synced");
        console.log("✅ Synced analysis:", row.result_id);
      } catch (error) {
        console.log("Firestore sync failed for", row.result_id, ":", error);
      }
    }
  },

  async deleteAnalysis(resultId: string) {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM Analysis_Results WHERE result_id = ?", [
      resultId,
    ]);

    try {
      await deleteDoc(doc(firestoreDb, "analysis_results", resultId));
    } catch (error) {
      console.log("Firestore sync failed (deleteAnalysis):", error);
    }
  },
};
