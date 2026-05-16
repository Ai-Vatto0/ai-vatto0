const request = require('supertest');
const app = require('../src/app');
const { getDb } = require('../src/database/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

function createUser(email, password, coins = 100) {
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, email, password_hash, coins) VALUES (?, ?, ?, ?, ?)')
    .run(id, 'TestUser', email, bcrypt.hashSync(password, 10), coins);
  return id;
}

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('sollte einen User erfolgreich einloggen', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      createUser(email, password);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(email);
    });

    it('sollte 401 bei falschem Passwort zurückgeben', async () => {
      const email = 'test@example.com';
      createUser(email, 'password123');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Falsche E-Mail oder Passwort');
    });

    it('sollte 401 bei unbekannter E-Mail zurückgeben', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Falsche E-Mail oder Passwort');
    });

    it('sollte 400 bei fehlenden Feldern zurückgeben', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('sollte User-Daten mit gültigem Token zurückgeben', async () => {
      const email = 'test@example.com';
      const userId = createUser(email, 'password123');
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(email);
      expect(res.body.is_admin).toBe(false);
    });

    it('sollte 401 ohne Token zurückgeben', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('sollte 401 mit ungültigem Token zurückgeben', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('sollte das Passwort ändern', async () => {
      const email = 'test@example.com';
      const oldPassword = 'password123';
      const userId = createUser(email, oldPassword);
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: oldPassword, newPassword: 'newpassword456' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Passwort geändert');

      const db = getDb();
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      expect(bcrypt.compareSync('newpassword456', user.password_hash)).toBe(true);
    });

    it('sollte 401 bei falschem aktuellem Passwort zurückgeben', async () => {
      const userId = createUser('test@example.com', 'password123');
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' });

      expect(res.status).toBe(401);
    });

    it('sollte 400 bei zu kurzem Passwort zurückgeben', async () => {
      const userId = createUser('test@example.com', 'password123');
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: '123' });

      expect(res.status).toBe(400);
    });
  });
});
