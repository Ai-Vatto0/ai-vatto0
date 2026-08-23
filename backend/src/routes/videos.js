const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const {
  getCoinCost,
  checkKieCredits,
  generateVideoGrok,
  generateVideoVeo31Fast,
  generateVideoKling3,
  checkVideoStatus,
  checkMarketTask,
} = require('../services/kieai');
const { videoQueue } = require('../services/generationQueue');
const validate = require('../middleware/validate');
const { videoGenerateSchema } = require('../validation/schemas');
const { videoGenerateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

function parseProductElementRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    elementName: row.element_name,
    description: row.description,
    referenceImages: JSON.parse(row.reference_images || '[]'),
    productLock: JSON.parse(row.product_lock || '{}'),
  };
}

function loadProductElement(db, userId, productElementId) {
  if (!productElementId) return null;
  try {
    const row = db.prepare('SELECT * FROM product_elements WHERE id = ? AND user_id = ? AND is_active = 1').get(productElementId, userId);
    return parseProductElementRow(row);
  } catch {
    // Alte Datenbank vor der product_elements Migration: sauber als nicht gefunden behandeln.
    return null;
  }
}

function bindKlingElementsToPrompt(prompt, elements) {
  let boundPrompt = String(prompt || '').trim();
  for (const element of elements || []) {
    const token = `@${element.name}`;
    if (!boundPrompt.includes(token)) boundPrompt += ` ${token}`;
  }
  return boundPrompt.trim();
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
      const kieStatus = job.model === 'kling3'
        ? await checkMarketTask(job.kie_task_id)
        : await checkVideoStatus(job.kie_task_id);
      const status = mapKieStatus(kieStatus.status || kieStatus.state);
      const resultUrl = kieStatus.video_url || kieStatus.result_url || kieStatus.output_url;
      const failMessage = kieStatus.fail_msg || kieStatus.failMsg || kieStatus.error_message || null;

      if (status !== job.status || (resultUrl && resultUrl !== job.result_url)) {
        db.prepare('UPDATE video_jobs SET status=?,result_url=?,error_message=?,completed_at=? WHERE id=?')
          .run(
            status,
            resultUrl || job.result_url,
            failMessage || job.error_message,
            (status === 'completed' || status === 'failed') ? new Date().toISOString() : null,
            job.id
          );
        if (status === 'failed') {
          db.transaction(() => {
            db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(job.coins_used, job.user_id);
            db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)')
              .run(uuidv4(), job.user_id, job.coins_used, 'credit', 'Rueckerstattung: Video fehlgeschlagen');
          })();
        }
      }
      const updated = db.prepare('SELECT * FROM video_jobs WHERE id = ?').get(job.id);
      return res.json({
        ...updated,
        reference_images: JSON.parse(updated.reference_images || '[]'),
        progress: kieStatus.progress,
        credits_consumed: kieStatus.credits_consumed,
        result_urls: kieStatus.result_urls,
        fail_code: kieStatus.fail_code,
      });
    } catch (err) {
      console.error('Video-Status fehlgeschlagen:', err.message);
      return res.json({ ...job, reference_images: JSON.parse(job.reference_images || '[]') });
    }
  }
  res.json({ ...job, reference_images: JSON.parse(job.reference_images || '[]') });
});

router.post('/generate', authMiddleware, videoGenerateLimiter, validate(videoGenerateSchema), async (req, res) => {
  const {
    model,
    prompt,
    duration,
    resolution,
    referenceImages,
    projectId,
    sceneId,
    startFrame,
    lastFrame,
    aspectRatio,
    mode,
    sound,
    multiShots,
    multiPrompt,
    klingElements,
    productElementId,
  } = req.body;

  if (!model || !prompt) return res.status(400).json({ error: 'Modell und Prompt erforderlich' });
  if (!['grok', 'veo31', 'kling3'].includes(model)) {
    return res.status(400).json({ error: 'Ungueltiges Modell. Erlaubt: grok, veo31, kling3' });
  }

  const dur = parseInt(duration, 10) || (model === 'kling3' ? 4 : 6);
  const res_ = resolution || (model === 'kling3' ? '1080p' : '720p');
  const refs = Array.isArray(referenceImages) ? referenceImages : [];

  // Referenz-Limits pro Modell
  if (model === 'veo31' && refs.length > 3) return res.status(400).json({ error: 'Veo 3.1 unterstuetzt maximal 3 Referenzbilder' });
  if (model === 'grok' && refs.length > 7) return res.status(400).json({ error: 'Grok unterstuetzt maximal 7 Referenzbilder' });

  const db = getDb();
  const savedElement = model === 'kling3' ? loadProductElement(db, req.user.id, productElementId) : null;
  if (productElementId && !savedElement) {
    return res.status(404).json({ error: 'Produkt-Element nicht gefunden oder nicht aktiv' });
  }

  let finalKlingElements = Array.isArray(klingElements) ? [...klingElements] : [];
  if (savedElement) {
    finalKlingElements.unshift({
      name: savedElement.elementName,
      description: savedElement.description || savedElement.name,
      element_input_urls: savedElement.referenceImages,
    });
  }
  if (finalKlingElements.length > 3) {
    return res.status(400).json({ error: 'Kling 3.0 unterstuetzt maximal 3 Elemente pro Task' });
  }
  if (model === 'kling3' && finalKlingElements.length > 0 && !startFrame) {
    return res.status(400).json({ error: 'Kling-Elementreferenzen benoetigen einen Startframe' });
  }

  // KIE verwendet ein Element nur dann sicher, wenn @element_name im Prompt vorkommt.
  // Bei gespeicherten Produkt-Elementen binden wir die Tokens automatisch ein.
  const effectivePrompt = model === 'kling3'
    ? bindKlingElementsToPrompt(prompt, finalKlingElements)
    : prompt;

  const klingMode = mode || 'pro';
  const coinCost = getCoinCost(model, dur, res_, klingMode);
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  if (user.coins < coinCost) return res.status(402).json({ error: `Nicht genug Coins. Benoetigt: ${coinCost}, Verfuegbar: ${user.coins}` });

  // Kie.ai Credits pruefen bevor Coins abgezogen werden
  const hasKieCredits = await checkKieCredits(50);
  if (!hasKieCredits) return res.status(503).json({ error: 'Service voruebergehend nicht verfuegbar. Bitte spaeter erneut versuchen.' });

  const jobId = uuidv4();
  const storedRefs = model === 'kling3'
    ? [startFrame, lastFrame, ...finalKlingElements.flatMap(el => el.element_input_urls || [])].filter(Boolean)
    : refs;

  // Deduct coins AND create job in a SINGLE transaction — prevents coin loss on crash
  try {
    db.transaction(() => {
      db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(coinCost, req.user.id);
      db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), req.user.id, -coinCost, 'debit', `Video: ${model} ${dur}s ${res_}`);
      db.prepare('INSERT INTO video_jobs (id, user_id, project_id, scene_id, model, resolution, duration, prompt, reference_images, status, coins_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(jobId, req.user.id, projectId || null, sceneId || null, model, res_, dur, effectivePrompt, JSON.stringify(storedRefs), 'pending', coinCost);
    })();
  } catch (txErr) {
    // Transaction failed atomically — no coins were deducted, no job was created
    return res.status(500).json({ error: 'Transaktion fehlgeschlagen: ' + txErr.message });
  }

  try {
    const kieResponse = await videoQueue.add(async () => {
      if (model === 'grok') return generateVideoGrok(effectivePrompt, refs, dur, res_);
      if (model === 'veo31') return generateVideoVeo31Fast(effectivePrompt, refs, dur);
      return generateVideoKling3({
        prompt: effectivePrompt,
        startFrame,
        lastFrame,
        duration: dur,
        aspectRatio: aspectRatio || '9:16',
        mode: klingMode,
        sound: sound !== undefined ? sound : true,
        multiShots: Boolean(multiShots),
        multiPrompt: multiPrompt || [],
        klingElements: finalKlingElements,
      });
    });

    const taskId = kieResponse?.data?.taskId
      || kieResponse?.data?.data?.taskId
      || kieResponse?.task_id
      || kieResponse?.id
      || kieResponse?.taskId;

    if (!taskId) throw new Error('KIE hat keine Task-ID zurueckgegeben');

    db.prepare('UPDATE video_jobs SET kie_task_id=?,status=? WHERE id=?').run(taskId, 'processing', jobId);
    res.status(201).json({
      jobId,
      kie_task_id: taskId,
      status: 'processing',
      coins_used: coinCost,
      model,
      mode: model === 'kling3' ? klingMode : undefined,
      sound: model === 'kling3' ? (sound !== undefined ? sound : true) : undefined,
      message: 'Gestartet',
    });
  } catch (err) {
    db.prepare('UPDATE video_jobs SET status=?,error_message=? WHERE id=?').run('failed', err.message, jobId);
    db.transaction(() => {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinCost, req.user.id);
      db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), req.user.id, coinCost, 'credit', 'Rueckerstattung: Video-Start fehlgeschlagen');
    })();
    res.status(500).json({ error: 'Fehler: ' + err.message });
  }
});

router.delete('/:jobId', authMiddleware, (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM video_jobs WHERE id = ? AND user_id = ?').get(req.params.jobId, req.user.id)) {
    return res.status(404).json({ error: 'Job nicht gefunden' });
  }
  db.prepare('DELETE FROM video_jobs WHERE id = ?').run(req.params.jobId);
  res.json({ message: 'Job geloescht' });
});

router.post('/estimate', authMiddleware, (req, res) => {
  const { model, duration, resolution, mode } = req.body;
  if (model && !['grok', 'veo31', 'kling3'].includes(model)) {
    return res.status(400).json({ error: 'Ungueltiges Modell. Erlaubt: grok, veo31, kling3' });
  }
  const effectiveModel = model || 'grok';
  const defaultDuration = effectiveModel === 'kling3' ? 4 : 6;
  const defaultResolution = effectiveModel === 'kling3' ? '1080p' : '720p';
  const cost = getCoinCost(effectiveModel, parseInt(duration, 10) || defaultDuration, resolution || defaultResolution, mode || 'pro');
  const user = getDb().prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  res.json({ coins_required: cost, coins_available: user.coins, can_generate: user.coins >= cost });
});

function mapKieStatus(status) {
  if (!status) return 'processing';
  const s = status.toLowerCase();
  if (['completed', 'success', 'done', 'finished'].includes(s)) return 'completed';
  if (['failed', 'fail', 'error'].includes(s)) return 'failed';
  return 'processing';
}

module.exports = router;
