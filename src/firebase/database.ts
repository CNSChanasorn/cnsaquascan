import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

async function ensureUsersHasAvatarColumn(database: SQLite.SQLiteDatabase) {
  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(Users);",
  );
  const hasAvatar = columns.some((c) => c.name === "avatar");

  if (!hasAvatar) {
    await database.execAsync("ALTER TABLE Users ADD COLUMN avatar TEXT;");
  }

  await database.execAsync(
    "UPDATE Users SET avatar = phone WHERE avatar IS NULL AND phone IS NOT NULL;",
  );
}

async function ensureOrangesHasImageColumn(database: SQLite.SQLiteDatabase) {
  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(Oranges_Data);",
  );
  const hasImage = columns.some((c) => c.name === "image_uri");

  if (!hasImage) {
    await database.execAsync(
      "ALTER TABLE Oranges_Data ADD COLUMN image_uri TEXT;",
    );
  }
}

export async function initializeDatabase() {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync("aquascan.db");

  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync("PRAGMA journal_mode = WAL;");

  await db.execAsync(`
    -- ✅ Users Table
    CREATE TABLE IF NOT EXISTS Users (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      avatar TEXT
    );

    -- ✅ Oranges_Data Table
    CREATE TABLE IF NOT EXISTS Oranges_Data (
      orange_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      variety TEXT NOT NULL,
      weight REAL NOT NULL,
      circle_line REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'synced')),
      image_uri TEXT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    -- ✅ Analysis_Results Table
    CREATE TABLE IF NOT EXISTS Analysis_Results (
      result_id TEXT PRIMARY KEY,
      orange_id TEXT NOT NULL,
      brix_value REAL NOT NULL,
      volume REAL NOT NULL,
      grade TEXT NOT NULL,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'synced')),
      FOREIGN KEY (orange_id) REFERENCES Oranges_Data(orange_id) ON DELETE CASCADE
    );

    -- ✅ สร้าง Index เพื่อเพิ่มความเร็ว
    CREATE INDEX IF NOT EXISTS idx_oranges_user_id ON Oranges_Data(user_id);
    CREATE INDEX IF NOT EXISTS idx_analysis_orange_id ON Analysis_Results(orange_id);
  `);

  await ensureUsersHasAvatarColumn(db);
  await ensureOrangesHasImageColumn(db);

  console.log("✅ Database initialized successfully");
  return db;
}

export async function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
