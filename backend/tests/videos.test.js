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

function createJob(userId, overrides = {}) {
  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO video_jobs (id, user_id, project_id, scene_id, model, resolution, duration, prompt, reference_images, status, coins_used, kie_task_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    overrides.projectId || null,
    overrides.sceneId || null,
    overrides.model || 'grok',
    overrides.resolution || '720p',
    overrides.duration || 6,
    overrides.prompt || 'Test prompt',
    JSON.stringify(overrides.referenceImages || []),
    overrides.status || 'pending',
    overrides.coinsUsed || 20,
    overrides.kieTaskId || null
  );
  return id;
}

describe('Videos Routes', () => {
  describe('GET /api/videos', () => {
    it('sollte alle Jobs des Users zurückgeben', async () => {
      const userId = createUser(100);
      const jobId = createJob(userId, { status: 'completed', prompt: 'Test video' });
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].prompt).toBe('Test video');
      expect(Array.isArray(res.body[0].reference_images)).toBe(true);
    });

    it('sollte nur eigene Jobs zurückgeben', async () => {
      const userId1 = createUser(100);
      const userId2 = createUser(100);
      createJob(userId1, { prompt: 'User1 video' });
      createJob(userId2, { prompt: 'User2 video' });
      const token = jwt.sign({ userId: userId1 }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].prompt).toBe('User1 video');
    });

    it('sollte 401 ohne Token zurückgeben', async () => {
      const res = await request(app).get('/api/videos');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/videos/:jobId/status', () => {
    it('sollte Job-Status zurückgeben', async () => {
      const userId = createUser(100);
      const jobId = createJob(userId, { status: 'processing' });
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get(`/api/videos/${jobId}/status`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('processing');
      expect(res.body.id).toBe(jobId);
    });

    it('sollte 404 für fremden Job zurückgeben', async () => {
      const userId1 = createUser(100);
      const userId2 = createUser(100);
      const jobId = createJob(userId2, { status: 'processing' });
      const token = jwt.sign({ userId: userId1 }, process.env.JWT_SECRET);

      const res = await request(app)
        .get(`/api/videos/${jobId}/status`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/videos/estimate', () => {
    it('sollte Kosten-Schätzung zurückgeben', async () => {
      const userId = createUser(100);
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/videos/estimate')
        .set('Authorization', `Bearer ${token}`)
        .send({ model: 'grok', duration: 10, resolution: '720p' });

      expect(res.status).toBe(200);
      expect(res.body.coins_required).toBe(30);
      expect(res.body.coins_available).toBe(100);
      expect(res.body.can_generate).toBe(true);
    });

    it('sollte false bei unzureichenden Coins zurückgeben', async () => {
      const userId = createUser(5);
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/videos/estimate')
        .set('Authorization', `Bearer ${token}`)
        .send({ model: 'veo31' });

      expect(res.status).toBe(200);
      expect(res.body.can_generate).toBe(false);
    });
  });

  describe('POST /api/videos/webhook', () => {
    it('sollte Status-Update über Webhook verarbeiten', async () => {
      const userId = createUser(100);
      const jobId = createJob(userId, { status: 'processing', kieTaskId: 'kie-task-123' });

      const res = await request(app)
        .post('/api/videos/webhook')
        .set('x-webhook-secret', process.env.WEBHOOK_SECRET)
        .send({ task_id: 'kie-task-123', status: 'completed', result_url: 'https://example.com/video.mp4', progress: 100 });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);

      const db = getDb();
      const updated = db.prepare('SELECT * FROM video_jobs WHERE id = ?').get(jobId);
      expect(updated.status).toBe('completed');
      expect(updated.result_url).toBe('https://example.com/video.mp4');
      expect(updated.progress).toBe(100);
      expect(updated.webhook_received_at).toBeTruthy();
    });

    it('sollte Coins bei Fehler über Webhook erstatten', async () => {
      const userId = createUser(100);
      const jobId = createJob(userId, { status: 'processing', kieTaskId: 'kie-task-456', coinsUsed: 20 });

      const res = await request(app)
        .post('/api/videos/webhook')
        .set('x-webhook-secret', process.env.WEBHOOK_SECRET)
        .send({ task_id: 'kie-task-456', status: 'failed', error_message: 'Generation failed' });

      expect(res.status).toBe(200);

      const db = getDb();
      const updated = db.prepare('SELECT * FROM video_jobs WHERE id = ?').get(jobId);
      expect(updated.status).toBe('failed');
      expect(updated.error_message).toBe('Generation failed');

      const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);
      expect(user.coins).toBe(120);
    });

    it('sollte 401 ohne oder mit falschem Webhook-Secret zurückgeben', async () => {
      const userId = createUser(100);
      createJob(userId, { status: 'processing', kieTaskId: 'kie-task-789' });

      const resNoSecret = await request(app)
        .post('/api/videos/webhook')
        .send({ task_id: 'kie-task-789', status: 'completed' });
      expect(resNoSecret.status).toBe(401);

      const resWrongSecret = await request(app)
        .post('/api/videos/webhook')
        .set('x-webhook-secret', 'wrong-secret')
        .send({ task_id: 'kie-task-789', status: 'completed' });
      expect(resWrongSecret.status).toBe(401);
    });

    it('sollte 400 ohne task_id zurückgeben', async () => {
      const res = await request(app)
        .post('/api/videos/webhook')
        .set('x-webhook-secret', process.env.WEBHOOK_SECRET)
        .send({ status: 'completed' });

      expect(res.status).toBe(400);
    });

    it('sollte 404 für unbekannten task_id zurückgeben', async () => {
      const res = await request(app)
        .post('/api/videos/webhook')
        .set('x-webhook-secret', process.env.WEBHOOK_SECRET)
        .send({ task_id: 'unknown-task', status: 'completed' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/videos/:jobId', () => {
    it('sollte einen Job löschen', async () => {
      const userId = createUser(100);
      const jobId = createJob(userId);
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      const res = await request(app)
        .delete(`/api/videos/${jobId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Job gelöscht');

      const db = getDb();
      const deleted = db.prepare('SELECT id FROM video_jobs WHERE id = ?').get(jobId);
      expect(deleted).toBeUndefined();
    });

    it('sollte 404 für fremden Job zurückgeben', async () => {
      const userId1 = createUser(100);
      const userId2 = createUser(100);
      const jobId = createJob(userId2);
      const token = jwt.sign({ userId: userId1 }, process.env.JWT_SECRET);

      const res = await request(app)
        .delete(`/api/videos/${jobId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
