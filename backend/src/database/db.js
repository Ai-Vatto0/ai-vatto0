const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './database.sqlite';
let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(path.resolve(DB_PATH));
  }
  return db;
}

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      coins INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Anime',
      gender TEXT DEFAULT '',
      age_look TEXT DEFAULT '',
      description TEXT DEFAULT '',
      style TEXT DEFAULT '',
      clothing TEXT DEFAULT '',
      features TEXT DEFAULT '',
      language TEXT DEFAULT 'Deutsch',
      tags TEXT DEFAULT '[]',
      is_main INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_images (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      view_type TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      genre TEXT DEFAULT '',
      mood TEXT DEFAULT '',
      target_platform TEXT DEFAULT 'TikTok',
      language TEXT DEFAULT 'Deutsch',
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scenes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      scene_number INTEGER NOT NULL,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      character_id TEXT,
      camera_notes TEXT DEFAULT '',
      audio_notes TEXT DEFAULT '',
      prompt TEXT DEFAULT '',
      model_recommendation TEXT DEFAULT 'grok',
      estimated_coins INTEGER DEFAULT 20,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS video_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      scene_id TEXT,
      model TEXT NOT NULL,
      resolution TEXT DEFAULT '720p',
      duration INTEGER DEFAULT 6,
      prompt TEXT NOT NULL,
      reference_images TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      result_url TEXT,
      coins_used INTEGER DEFAULT 0,
      kie_task_id TEXT,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS coin_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT DEFAULT '',
      admin_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS magic_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_video_jobs_user_status ON video_jobs(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id, created_at);
  `);

  // Migration: add is_banned column if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0`);
  } catch {
    // Column already exists — safe to ignore
  }

  // Migration: video_jobs progress tracking
  const videoJobMigrations = [
    `ALTER TABLE video_jobs ADD COLUMN progress INTEGER DEFAULT 0`,
    `ALTER TABLE video_jobs ADD COLUMN retry_count INTEGER DEFAULT 0`,
    `ALTER TABLE video_jobs ADD COLUMN last_polled_at TEXT`,
    `ALTER TABLE video_jobs ADD COLUMN webhook_received_at TEXT`,
  ];
  videoJobMigrations.forEach(sql => {
    try { db.exec(sql); } catch { /* Column already exists */ }
  });

  // Admin-User erstellen falls keine User existieren
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (row.count === 0) {
    const { v4: uuidv4 } = require('uuid');
    const adminId = uuidv4();
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('⚠️ ADMIN_PASSWORD nicht gesetzt — Admin-User wird nicht erstellt');
      return;
    }
    const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ki-app.com';

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, coins, is_admin)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'Admin', adminEmail, passwordHash, 999999, 1);

    console.log(`👤 Admin-User erstellt: ${adminEmail}`);
  }

  console.log('📦 Datenbank-Schema initialisiert');
}

module.exports = { getDb, initDatabase };
