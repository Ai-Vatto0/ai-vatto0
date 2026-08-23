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

    CREATE TABLE IF NOT EXISTS product_elements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      element_name TEXT NOT NULL,
      description TEXT DEFAULT '',
      reference_images TEXT NOT NULL DEFAULT '[]',
      product_lock TEXT NOT NULL DEFAULT '{}',
      source_notes TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, slug)
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
    CREATE INDEX IF NOT EXISTS idx_product_elements_user_active ON product_elements(user_id, is_active);
  `);

  // Migration: add is_banned column if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0`);
  } catch {
    // Column already exists — safe to ignore
  }

  // Admin-User erstellen falls keine User existieren
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (row.count === 0) {
    const { v4: uuidv4 } = require('uuid');
    const adminId = uuidv4();
    const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin123!', 10);

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, coins, is_admin)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, process.env.ADMIN_EMAIL || 'admin@ki-app.com', process.env.ADMIN_EMAIL || 'admin@ki-app.com', passwordHash, 999999, 1);

    // Admin-User korrekt: username und email getrennt
    db.prepare('DELETE FROM users WHERE id = ?').run(adminId);
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, coins, is_admin)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, 'Admin', process.env.ADMIN_EMAIL || 'admin@ki-app.com', passwordHash, 999999, 1);

    console.log(`👤 Admin-User erstellt: ${process.env.ADMIN_EMAIL || 'admin@ki-app.com'}`);
  }

  console.log('📦 Datenbank-Schema initialisiert');
}

module.exports = { getDb, initDatabase };
