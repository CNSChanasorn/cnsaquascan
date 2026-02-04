import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getDatabase } from "../database";
import { db as firestoreDb } from "../firebase";

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

    return orangeId;
  },

  async getOrangesByUser(userId: string) {
    const db = await getDatabase();
    const localRows = await db.getAllAsync(
      "SELECT * FROM Oranges_Data WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    const normalizeCreatedAt = (value: any) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (value?.toDate) {
        return value.toDate().toISOString();
      }
      const time = new Date(value).getTime();
      if (Number.isNaN(time)) return null;
      return new Date(time).toISOString();
    };

    const sortByCreatedAtDesc = (rows: any[]) =>
      rows.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });

    const mapDocs = (docs: any[]) =>
      docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = normalizeCreatedAt(data.created_at);
        return {
          orange_id: data.orange_id || docSnap.id,
          ...data,
          created_at: createdAt || data.created_at || null,
        };
      });

    const fetchRemoteRows = async (field: "user_id" | "userId" | "uid") => {
      const orderedQuery = query(
        collection(firestoreDb, "oranges"),
        where(field, "==", userId),
        orderBy("created_at", "desc"),
      );
      const snapshot = await getDocs(orderedQuery);
      return mapDocs(snapshot.docs);
    };

    const fetchRemoteRowsNoOrder = async (
      field: "user_id" | "userId" | "uid",
    ) => {
      const simpleQuery = query(
        collection(firestoreDb, "oranges"),
        where(field, "==", userId),
      );
      const snapshot = await getDocs(simpleQuery);
      return mapDocs(snapshot.docs);
    };

    const fetchAndMergeRemote = async () => {
      let remoteRows: any[] = [];
      const fields: ("user_id" | "userId" | "uid")[] = [
        "user_id",
        "userId",
        "uid",
      ];

      for (const field of fields) {
        try {
          remoteRows = await fetchRemoteRows(field);
        } catch (error: any) {
          const message = String(error?.message || "");
          if (message.includes("requires an index")) {
            remoteRows = await fetchRemoteRowsNoOrder(field);
          } else {
            throw error;
          }
        }

        if (remoteRows.length > 0) {
          break;
        }
      }

      sortByCreatedAtDesc(remoteRows);

      if (remoteRows.length === 0) {
        return localRows;
      }

      await db.execAsync("BEGIN TRANSACTION;");
      try {
        for (const row of remoteRows) {
          await db.runAsync(
            `INSERT OR REPLACE INTO Oranges_Data
             (orange_id, user_id, variety, weight, circle_line, created_at, status, image_uri)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row.orange_id,
              row.user_id,
              row.variety,
              row.weight,
              row.circle_line,
              row.created_at || new Date().toISOString(),
              row.status || "pending",
              row.image_uri || null,
            ],
          );
        }
        await db.execAsync("COMMIT;");
      } catch (err) {
        await db.execAsync("ROLLBACK;");
        throw err;
      }

      const mergedRows = await db.getAllAsync(
        "SELECT * FROM Oranges_Data WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
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
            console.log("Firestore fetch failed (getOrangesByUser):", error);
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
      console.log("Firestore fetch failed (getOrangesByUser):", error);
      return localRows;
    }
  },

  async getAllOranges() {
    const db = await getDatabase();
    const localRows = await db.getAllAsync(
      "SELECT * FROM Oranges_Data ORDER BY created_at DESC",
    );

    const normalizeCreatedAt = (value: any) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (value?.toDate) {
        return value.toDate().toISOString();
      }
      const time = new Date(value).getTime();
      if (Number.isNaN(time)) return null;
      return new Date(time).toISOString();
    };

    const sortByCreatedAtDesc = (rows: any[]) =>
      rows.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });

    const mapDocs = (docs: any[]) =>
      docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = normalizeCreatedAt(data.created_at);
        return {
          orange_id: data.orange_id || docSnap.id,
          ...data,
          created_at: createdAt || data.created_at || null,
        };
      });

    const fetchRemoteRows = async () => {
      const orderedQuery = query(
        collection(firestoreDb, "oranges"),
        orderBy("created_at", "desc"),
      );
      const snapshot = await getDocs(orderedQuery);
      return mapDocs(snapshot.docs);
    };

    const fetchRemoteRowsNoOrder = async () => {
      const simpleQuery = query(collection(firestoreDb, "oranges"));
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

      sortByCreatedAtDesc(remoteRows);

      if (remoteRows.length === 0) {
        return localRows;
      }

      await db.execAsync("BEGIN TRANSACTION;");
      try {
        for (const row of remoteRows) {
          await db.runAsync(
            `INSERT OR REPLACE INTO Oranges_Data
             (orange_id, user_id, variety, weight, circle_line, created_at, status, image_uri)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row.orange_id,
              row.user_id || null,
              row.variety,
              row.weight,
              row.circle_line,
              row.created_at || new Date().toISOString(),
              row.status || "pending",
              row.image_uri || null,
            ],
          );
        }
        await db.execAsync("COMMIT;");
      } catch (err) {
        await db.execAsync("ROLLBACK;");
        throw err;
      }

      const mergedRows = await db.getAllAsync(
        "SELECT * FROM Oranges_Data ORDER BY created_at DESC",
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
            console.log("Firestore fetch failed (getAllOranges):", error);
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
      console.log("Firestore fetch failed (getAllOranges):", error);
      return localRows;
    }
  },

  async getOrangeById(orangeId: string) {
    const db = await getDatabase();
    return await db.getFirstAsync(
      "SELECT * FROM Oranges_Data WHERE orange_id = ?",
      [orangeId],
    );
  },

  async updateOrangeStatus(orangeId: string, status: string) {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE Oranges_Data SET status = ? WHERE orange_id = ?",
      [status, orangeId],
    );

    try {
      await setDoc(
        doc(firestoreDb, "oranges", orangeId),
        {
          status,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.log("Firestore sync failed (updateOrangeStatus):", error);
    }
  },

  async syncPendingOranges() {
    const db = await getDatabase();
    const pendingRows: any[] = await db.getAllAsync(
      "SELECT * FROM Oranges_Data WHERE status = 'pending'",
    );

    if (pendingRows.length === 0) return;

    for (const row of pendingRows) {
      try {
        await setDoc(
          doc(firestoreDb, "oranges", row.orange_id),
          {
            orange_id: row.orange_id,
            user_id: row.user_id,
            variety: row.variety,
            weight: row.weight,
            circle_line: row.circle_line,
            created_at: row.created_at || new Date().toISOString(),
            status: "synced",
            image_uri: row.image_uri || null,
            updated_at: new Date().toISOString(),
          },
          { merge: true },
        );

        await this.updateOrangeStatus(row.orange_id, "synced");
        console.log("✅ Synced orange:", row.orange_id);
      } catch (error) {
        console.log("Firestore sync failed for", row.orange_id, ":", error);
      }
    }
  },

  async deleteOrange(orangeId: string) {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM Oranges_Data WHERE orange_id = ?", [
      orangeId,
    ]);

    try {
      await deleteDoc(doc(firestoreDb, "oranges", orangeId));
    } catch (error) {
      console.log("Firestore sync failed (deleteOrange):", error);
    }
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
          status,
          orangeId,
        ],
      );
    } else {
      await db.runAsync(
        `UPDATE Oranges_Data
         SET variety = ?, weight = ?, circle_line = ?, image_uri = ?, status = ?
         WHERE orange_id = ?`,
        [variety, weight, circleLine, imageUri || null, status, orangeId],
      );
    }
  },
};
