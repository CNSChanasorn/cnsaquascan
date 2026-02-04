import { doc, setDoc } from "firebase/firestore";
import { getDatabase } from "../database";
import { db as firestoreDb } from "../firebase";

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

    try {
      await setDoc(
        doc(firestoreDb, "users", userId),
        {
          user_id: userId,
          username,
          full_name: fullName,
          email,
          phone: phone || null,
          avatar: avatar || null,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.log("Firestore sync failed (createUser):", error);
    }
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

    try {
      await setDoc(
        doc(firestoreDb, "users", userId),
        {
          full_name: fullName,
          phone: phone || null,
          avatar: avatar || null,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.log("Firestore sync failed (updateUser):", error);
    }
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    const db = await getDatabase();
    await db.runAsync("UPDATE Users SET avatar = ? WHERE user_id = ?", [
      avatarUrl,
      userId,
    ]);

    try {
      await setDoc(
        doc(firestoreDb, "users", userId),
        {
          avatar: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (error) {
      console.log("Firestore sync failed (updateAvatar):", error);
    }
  },
};
