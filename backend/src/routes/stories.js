const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { generateScenesWithLLM, COIN_COSTS } = require('../services/kieai');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.json(getDb().prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id));
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
  const scenes = db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY scene_number').all(req.params.id);
  res.json({ ...project, scenes });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, genre, mood, target_platform, language } = req.body;
  if (!name) return res.status(400).json({ error: 'Projektname erforderlich' });
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO projects (id, user_id, name, genre, mood, target_platform, language) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, name, genre || '', mood || '', target_platform || 'TikTok', language || 'Deutsch');
  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id = ?').get(id));
});

router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
  const { name, genre, mood, target_platform, language, status } = req.body;
  db.prepare('UPDATE projects SET name=?,genre=?,mood=?,target_platform=?,language=?,status=? WHERE id=?')
    .run(name || project.name, genre ?? project.genre, mood ?? project.mood, target_platform || project.target_platform, language || project.language, status || project.status, req.params.id);
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)) return res.status(404).json({ error: 'Projekt nicht gefunden' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Projekt gelöscht' });
});

router.post('/:id/generate-scenes', authMiddleware, async (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
  const { idea, sceneCount, characterId } = req.body;
  if (!idea) return res.status(400).json({ error: 'Story-Idee erforderlich' });

  const count = Math.min(parseInt(sceneCount) || 3, 6);
  const totalCost = count * COIN_COSTS.scene_generation;
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  if (user.coins < totalCost) return res.status(402).json({ error: `Nicht genug Coins. Benötigt: ${totalCost}` });

  const character = characterId ? db.prepare('SELECT * FROM characters WHERE id = ? AND user_id = ?').get(characterId, req.user.id) : null;
  db.transaction(() => {
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(totalCost, req.user.id);
    db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.user.id, -totalCost, 'debit', `Szenen generiert für: ${project.name}`);
  })();

  try {
    const scenes = await generateScenesWithLLM({ idea, sceneCount: count, genre: project.genre, mood: project.mood, targetPlatform: project.target_platform, language: project.language, characterDescription: character ? `${character.name}: ${character.description}` : '' });
    db.prepare('DELETE FROM scenes WHERE project_id = ?').run(req.params.id);
    const ins = db.prepare('INSERT INTO scenes (id, project_id, scene_number, title, content, camera_notes, audio_notes, prompt, model_recommendation, estimated_coins) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const s of scenes) ins.run(uuidv4(), req.params.id, s.scene_number, s.title || '', s.content || '', s.camera_notes || '', s.audio_notes || '', s.prompt || '', s.model_recommendation || 'grok', s.estimated_coins || 20);
    res.json({ scenes: db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY scene_number').all(req.params.id), coins_used: totalCost });
  } catch (err) {
    db.transaction(() => {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(totalCost, req.user.id);
      db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.user.id, totalCost, 'credit', 'Rückerstattung: Szenen fehlgeschlagen');
    })();
    res.status(500).json({ error: 'Fehler: ' + err.message });
  }
});

router.put('/:id/scenes/:sceneId', authMiddleware, (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)) return res.status(404).json({ error: 'Projekt nicht gefunden' });
  const scene = db.prepare('SELECT * FROM scenes WHERE id = ? AND project_id = ?').get(req.params.sceneId, req.params.id);
  if (!scene) return res.status(404).json({ error: 'Szene nicht gefunden' });
  const { title, content, camera_notes, audio_notes, prompt, model_recommendation } = req.body;
  db.prepare('UPDATE scenes SET title=?,content=?,camera_notes=?,audio_notes=?,prompt=?,model_recommendation=? WHERE id=?')
    .run(title ?? scene.title, content ?? scene.content, camera_notes ?? scene.camera_notes, audio_notes ?? scene.audio_notes, prompt ?? scene.prompt, model_recommendation || scene.model_recommendation, req.params.sceneId);
  res.json(db.prepare('SELECT * FROM scenes WHERE id = ?').get(req.params.sceneId));
});

module.exports = router;
