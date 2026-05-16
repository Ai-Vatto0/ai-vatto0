const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/database/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

function createUser(coins = 100) {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, email, password_hash, coins) VALUES (?, ?, ?, ?, ?)')
    .run(id, 'TestUser', `test${Date.now()}@example.com`, bcrypt.hashSync('password123', 10), coins);
  return id;
}

describe('Coins Routes', () => {
  describe('GET /api/coins/balance', () => {
    it('sollte den Coin-Stand zurückgeben', async () => {
      const userId = createUser(250);
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/coins/balance')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.coins).toBe(250);
    });

    it('sollte 401 ohne Token zurückgeben', async () => {
      const res = await request(app).get('/api/coins/balance');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/coins/history', () => {
    it('sollte die Transaktionshistorie zurückgeben', async () => {
      const userId = createUser(100);
      const db = getDb();
      db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), userId, -20, 'debit', 'Video-Generierung');
      db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), userId, 50, 'credit', 'Admin-Aufladung');

      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/coins/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].type).toBe('credit');
    });

    it('sollte leeres Array bei neuem User zurückgeben', async () => {
      const userId = createUser(100);
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/coins/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
