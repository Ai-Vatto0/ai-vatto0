const { initDatabase, getDb } = require('../src/database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.ADMIN_EMAIL = 'admin@test.com';
  process.env.ADMIN_PASSWORD = 'testpassword123';
  process.env.RESEND_API_KEY = 're_test_dummy_key';
  process.env.WEBHOOK_SECRET = 'test-webhook-secret-123';
  process.env.DATABASE_PATH = ':memory:';
  initDatabase();
});

beforeEach(() => {
  const db = getDb();
  db.prepare('DELETE FROM coin_transactions').run();
  db.prepare('DELETE FROM magic_links').run();
  db.prepare('DELETE FROM video_jobs').run();
  db.prepare('DELETE FROM scenes').run();
  db.prepare('DELETE FROM projects').run();
  db.prepare('DELETE FROM character_images').run();
  db.prepare('DELETE FROM characters').run();
  db.prepare('DELETE FROM users').run();
});

function createTestUser({ email = 'test@example.com', password = 'password123', coins = 100, isAdmin = false } = {}) {
  const db = getDb();
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, coins, is_admin) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, 'TestUser', email, passwordHash, coins, isAdmin ? 1 : 0);
  return { id, email, password };
}

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { createTestUser, createToken };
