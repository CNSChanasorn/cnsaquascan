import { getDatabase } from "../database";
import { syncManager } from "../SyncManager";

/**
 * userRepository - Offline-first
 * ทุก operation บันทึกลง SQLite ก่อน แล้ว queue sync ไป Firebase
 */
export const userRepository = {
  async createUser(
    userId: string,
    username: string,
    fullName: string,
    email: string,
    phone?: string,
    avatar?: string,
  ) {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO Users (user_id, username, full_name, email, phone, avatar) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, username, fullName, email, phone || null, avatar || null],
    );

    // Queue sync to Firebase
    await syncManager.queueSync("users", userId, "create", {
      user_id: userId,
      username,
      full_name: fullName,
      email,
      phone: phone || null,
      avatar: avatar || null,
    });

    void syncManager.processQueue();
  },

  async getUserById(userId: string) {
    const db = await getDatabase();
    return await db.getFirstAsync("SELECT * FROM Users WHERE user_id = ?", [
      userId,
    ]);
  },

  async getUserByEmail(email: string) {
    const db = await getDatabase();
    return await db.getFirstAsync("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
  },

  async getUserByUsername(username: string) {
    const db = await getDatabase();
    return await db.getFirstAsync("SELECT * FROM Users WHERE username = ?", [
      username,
    ]);
  },

  async updateUser(
    userId: string,
    fullName: string,
    phone: string | null,
    avatar: string | null,
  ) {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE Users SET full_name = ?, phone = ?, avatar = ? WHERE user_id = ?",
      [fullName, phone, avatar, userId],
    );

    // Queue sync to Firebase
    await syncManager.queueSync("users", userId, "update", {
      user_id: userId,
      full_name: fullName,
      phone: phone || null,
      avatar: avatar || null,
    });

    void syncManager.processQueue();
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    const db = await getDatabase();
    await db.runAsync("UPDATE Users SET avatar = ? WHERE user_id = ?", [
      avatarUrl,
      userId,
    ]);

    // Queue sync to Firebase
    await syncManager.queueSync("users", userId, "update", {
      user_id: userId,
      avatar: avatarUrl,
    });

    void syncManager.processQueue();
  },
};
