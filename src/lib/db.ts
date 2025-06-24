'use server';

import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

const DB_FILE = 'media_library.sqlite';
const dbPath = path.join(process.cwd(), DB_FILE);
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb() {
  if (db) return db;

  try {
    await fs.access(path.dirname(dbPath));
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
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
      next_compression_date TEXT,
      nas_backup_status INTEGER DEFAULT 0,
      gphotos_backup_status INTEGER DEFAULT 0,
      icloud_upload_status INTEGER DEFAULT 0,
      staging_path TEXT NOT NULL
    );
  `);
}
