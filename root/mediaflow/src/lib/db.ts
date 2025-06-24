import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { getSettings } from '@/app/(app)/settings/actions';
import fs from 'fs/promises';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb() {
  if (db) return db;

  const settings = await getSettings();
  let dbPath = settings.dbPath;

  if (!path.isAbsolute(dbPath)) {
    dbPath = path.join(process.cwd(), dbPath);
  }

  const dir = path.dirname(dbPath);
  try {
      await fs.mkdir(dir, { recursive: true });
  } catch (err: any) {
      console.error(`Failed to create database directory at ${dir}. This may be a permissions issue.`);
      throw new Error(`Database directory creation failed: ${err.message}`);
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initDb(db);
  return db;
}

async function initDb(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_hash TEXT NOT NULL UNIQUE,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      original_size_mb REAL NOT NULL,
      compressed_size_mb REAL,
      status TEXT NOT NULL DEFAULT 'pending',
      camera TEXT,
      created_date TEXT NOT NULL,
      last_compressed_date TEXT,
      nas_backup_status INTEGER DEFAULT 0,
      gphotos_backup_status INTEGER DEFAULT 0,
      icloud_upload_status INTEGER DEFAULT 0,
      staging_path TEXT,
      archive_path TEXT,
      processed_path TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS stats (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
    );
  `);

  await db.run("INSERT OR IGNORE INTO stats (key, value) VALUES ('duplicates_found', 0)");
  await db.run("INSERT OR IGNORE INTO stats (key, value) VALUES ('storage_saved_mb', 0)");
  await db.run("INSERT OR IGNORE INTO stats (key, value) VALUES ('processing_errors', 0)");
}
