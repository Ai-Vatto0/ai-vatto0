const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { getCoinCost, checkKieCredits, generateVideoGrok, generateVideoVeo31Fast, checkVideoStatus } = require('../services/kieai');
const { videoQueue } = require('../services/generationQueue');
const validate = require('../middleware/validate');
const { videoGenerateSchema } = require('../validation/schemas');
const { videoGenerateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

function refundCoins(db, userId, amount, description) {
  db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(amount, userId);
  db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), userId, amount, 'credit', description);
}

function extractProgress(kieStatus) {
  if (!kieStatus || typeof kieStatus !== 'object') return 0;
  const raw = kieStatus.progress ?? kieStatus.percent ?? kieStatus.completion ?? kieStatus.percentage;
  if (typeof raw === 'number') return Math.max(0, Math.min(100, Math.round(raw)));
  if (typeof raw === 'string') {
    const parsed = parseInt(raw.replace('%', '').trim(), 10);
    if (!isNaN(parsed)) return Math.max(0, Math.min(100, parsed));
  }
  const state = (kieStatus.status || kieStatus.state || '').toLowerCase();
  if (state === 'pending') return 0;
  if (state === 'processing' || state === 'running') return 50;
  if (['completed', 'success', 'done', 'finished'].includes(state)) return 100;
  if (['failed', 'error'].includes(state)) return 0;
  return 0;
}

router.get('/', authMiddleware, (req, res) => {
  const jobs = getDb().prepare('SELECT * FROM video_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(jobs.map(j => ({ ...j, reference_images: JSON.parse(j.reference_images || '[]') })));
});

router.get('/:jobId/status', authMiddleware, async (req, res) => {
  const db = getDb();
  const job = db.prepare('SELECT * FROM video_jobs WHERE id = ? AND user_id = ?').get(req.params.jobId, req.user.id);
  if (!job) return res.status(404).json({ error: 'Job nicht gefunden' });
  if (job.status === 'completed' || job.status === 'failed') {
    return res.json({ ...job, reference_images: JSON.parse(job.reference_images || '[]') });
  }

  if (job.kie_task_id) {
    try {
      const kieStatus = await checkVideoStatus(job.kie_task_id);
      const status = mapKieStatus(kieStatus.status || kieStatus.state);
      const resultUrl = kieStatus.video_url || kieStatus.result_url || kieStatus.output_url;
      const progress = extractProgress(kieStatus);
      const now = new Date().toISOString();

      const needsUpdate = status !== job.status || (resultUrl && resultUrl !== job.result_url) || progress !== (job.progress || 0);
      if (needsUpdate) {
        db.prepare('UPDATE video_jobs SET status=?, result_url=?, progress=?, last_polled_at=?, completed_at=? WHERE id=?')
          .run(
            status,
            resultUrl || job.result_url || null,
            progress,
            now,
            ((status === 'completed' || status === 'failed') && !job.completed_at) ? now : job.completed_at || null,
            job.id
          );
        if (status === 'failed' && job.status !== 'failed') {
          refundCoins(db, job.user_id, job.coins_used, 'Rückerstattung: Video fehlgeschlagen');
        }
      } else {
        db.prepare('UPDATE video_jobs SET last_polled_at = ? WHERE id = ?')
          .run(now, job.id);
      }
      const updated = db.prepare('SELECT * FROM video_jobs WHERE id = ?').get(job.id);
      return res.json({ ...updated, reference_images: JSON.parse(updated.reference_images || '[]') });
    } catch (err) {
      console.error('Video-Status-Check fehlgeschlagen:', err.message);
      return res.json({ ...job, reference_images: JSON.parse(job.reference_images || '[]') });
    }
  }
  res.json({ ...job, reference_images: JSON.parse(job.reference_images || '[]') });
});

router.post('/generate', authMiddleware, videoGenerateLimiter, validate(videoGenerateSchema), async (req, res) => {
  const { model, prompt, duration, resolution, referenceImages, projectId, sceneId } = req.body;
  if (!model || !prompt) return res.status(400).json({ error: 'Modell und Prompt erforderlich' });
  if (!['grok', 'veo31'].includes(model)) return res.status(400).json({ error: 'Ungültiges Modell. Erlaubt: grok, veo31' });

  const dur = parseInt(duration) || 6;
  const res_ = resolution || '720p';
  const refs = Array.isArray(referenceImages) ? referenceImages : [];

  // Referenz-Limits pro Modell
  if (model === 'veo31' && refs.length > 3) return res.status(400).json({ error: 'Veo 3.1 unterstützt maximal 3 Referenzbilder' });
  if (model === 'grok' && refs.length > 7) return res.status(400).json({ error: 'Grok unterstützt maximal 7 Referenzbilder' });

  const coinCost = getCoinCost(model, dur, res_);
  const db = getDb();
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  if (user.coins < coinCost) return res.status(402).json({ error: `Nicht genug Coins. Benötigt: ${coinCost}, Verfügbar: ${user.coins}` });

  // Kie.ai Credits prüfen bevor Coins abgezogen werden
  const hasKieCredits = await checkKieCredits(50);
  if (!hasKieCredits) return res.status(503).json({ error: 'Service vorübergehend nicht verfügbar. Bitte später erneut versuchen.' });

  const jobId = uuidv4();

  // Deduct coins AND create job atomisch — prevents coin loss on crash
  try {
    db.exec('BEGIN');
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(coinCost, req.user.id);
    db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.user.id, -coinCost, 'debit', `Video: ${model} ${dur}s ${res_}`);
    db.prepare('INSERT INTO video_jobs (id, user_id, project_id, scene_id, model, resolution, duration, prompt, reference_images, status, coins_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(jobId, req.user.id, projectId || null, sceneId || null, model, res_, dur, prompt, JSON.stringify(refs), 'pending', coinCost);
    db.exec('COMMIT');
  } catch (txErr) {
    try { db.exec('ROLLBACK'); } catch { /* ignore rollback errors */ }
    return res.status(500).json({ error: 'Transaktion fehlgeschlagen: ' + txErr.message });
  }

  try {
    const kieResponse = await videoQueue.add(async () => {
      if (model === 'grok') return generateVideoGrok(prompt, refs, dur, res_);
      return generateVideoVeo31Fast(prompt, refs, dur);
    });

    const taskId = kieResponse?.task_id || kieResponse?.id || kieResponse?.taskId;
    db.prepare('UPDATE video_jobs SET kie_task_id=?,status=? WHERE id=?').run(taskId || null, 'processing', jobId);
    res.status(201).json({ jobId, status: 'processing', coins_used: coinCost, message: 'Gestartet' });
  } catch (err) {
    db.prepare('UPDATE video_jobs SET status=?, error_message=? WHERE id=?').run('failed', err.message, jobId);
    refundCoins(db, req.user.id, coinCost, 'Rückerstattung: Video-Start fehlgeschlagen');
    res.status(500).json({ error: 'Fehler: ' + err.message });
  }
});

router.delete('/:jobId', authMiddleware, (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM video_jobs WHERE id = ? AND user_id = ?').get(req.params.jobId, req.user.id)) {
    return res.status(404).json({ error: 'Job nicht gefunden' });
  }
  db.prepare('DELETE FROM video_jobs WHERE id = ?').run(req.params.jobId);
  res.json({ message: 'Job gelöscht' });
});

router.post('/estimate', authMiddleware, (req, res) => {
  const { model, duration, resolution } = req.body;
  if (model && !['grok', 'veo31'].includes(model)) {
    return res.status(400).json({ error: 'Ungültiges Modell. Erlaubt: grok, veo31' });
  }
  const cost = getCoinCost(model || 'grok', parseInt(duration) || 6, resolution || '720p');
  const user = getDb().prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  res.json({ coins_required: cost, coins_available: user.coins, can_generate: user.coins >= cost });
});

// Webhook für Kie.ai Status-Updates — durch WEBHOOK_SECRET geschützt
router.post('/webhook', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { task_id, status, result_url, error_message, progress } = req.body;
  if (!task_id) return res.status(400).json({ error: 'task_id erforderlich' });

  const db = getDb();
  const job = db.prepare('SELECT * FROM video_jobs WHERE kie_task_id = ?').get(task_id);
  if (!job) return res.status(404).json({ error: 'Job nicht gefunden' });

  const mappedStatus = mapKieStatus(status);
  const progressValue = progress !== undefined ? Math.max(0, Math.min(100, Math.round(progress))) : extractProgress(req.body);
  const now = new Date().toISOString();

  db.prepare('UPDATE video_jobs SET status=?, result_url=?, progress=?, error_message=?, webhook_received_at=?, completed_at=? WHERE id=?')
    .run(
      mappedStatus,
      result_url || job.result_url || null,
      progressValue,
      error_message || job.error_message || null,
      now,
      ((mappedStatus === 'completed' || mappedStatus === 'failed') && !job.completed_at) ? now : job.completed_at || null,
      job.id
    );

  if (mappedStatus === 'failed' && job.status !== 'failed') {
    refundCoins(db, job.user_id, job.coins_used, 'Rückerstattung: Video fehlgeschlagen (Webhook)');
  }

  res.json({ received: true });
});

function mapKieStatus(status) {
  if (!status) return 'processing';
  const s = status.toLowerCase();
  if (['completed', 'success', 'done', 'finished'].includes(s)) return 'completed';
  if (['failed', 'error'].includes(s)) return 'failed';
  return 'processing';
}

module.exports = router;
