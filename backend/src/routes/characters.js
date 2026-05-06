const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const characters = db.prepare(`
    SELECT c.*, GROUP_CONCAT(ci.view_type || '::' || ci.image_url) as images_raw
    FROM characters c LEFT JOIN character_images ci ON c.id = ci.character_id
    WHERE c.user_id = ? GROUP BY c.id ORDER BY c.created_at DESC
  `).all(req.user.id);
  res.json(characters.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]'), is_main: c.is_main === 1, images: parseImages(c.images_raw) })));
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const character = db.prepare('SELECT * FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!character) return res.status(404).json({ error: 'Charakter nicht gefunden' });
  const images = db.prepare('SELECT * FROM character_images WHERE character_id = ?').all(req.params.id);
  res.json({ ...character, tags: JSON.parse(character.tags || '[]'), is_main: character.is_main === 1, images });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, category, gender, age_look, description, style, clothing, features, language, tags, is_main } = req.body;
  if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });
  const db = getDb();
  const id = uuidv4();
  db.prepare(`INSERT INTO characters (id, user_id, name, category, gender, age_look, description, style, clothing, features, language, tags, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.user.id, name, category || 'Anime', gender || '', age_look || '', description || '', style || '', clothing || '', features || '', language || 'Deutsch', JSON.stringify(tags || []), is_main ? 1 : 0);
  const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  res.status(201).json({ ...character, tags: JSON.parse(character.tags), is_main: character.is_main === 1, images: [] });
});

router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Charakter nicht gefunden' });
  const { name, category, gender, age_look, description, style, clothing, features, language, tags, is_main } = req.body;
  db.prepare(`UPDATE characters SET name=?,category=?,gender=?,age_look=?,description=?,style=?,clothing=?,features=?,language=?,tags=?,is_main=? WHERE id=?`)
    .run(name || existing.name, category || existing.category, gender ?? existing.gender, age_look ?? existing.age_look, description ?? existing.description, style ?? existing.style, clothing ?? existing.clothing, features ?? existing.features, language || existing.language, JSON.stringify(tags || JSON.parse(existing.tags)), is_main !== undefined ? (is_main ? 1 : 0) : existing.is_main, req.params.id);
  const updated = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  const images = db.prepare('SELECT * FROM character_images WHERE character_id = ?').all(req.params.id);
  res.json({ ...updated, tags: JSON.parse(updated.tags), is_main: updated.is_main === 1, images });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT * FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)) return res.status(404).json({ error: 'Charakter nicht gefunden' });
  db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM character_images WHERE character_id = ?').run(req.params.id);
  res.json({ message: 'Charakter gelöscht' });
});

router.post('/:id/images', authMiddleware, upload.single('image'), (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)) return res.status(404).json({ error: 'Charakter nicht gefunden' });
  if (!req.file) return res.status(400).json({ error: 'Kein Bild hochgeladen' });
  const { view_type } = req.body;
  const validViews = ['front', 'left', 'right', 'back', 'closeup_front', 'closeup_left', 'closeup_right', 'extra'];
  if (!validViews.includes(view_type)) return res.status(400).json({ error: 'Ungültiger view_type' });
  db.prepare('DELETE FROM character_images WHERE character_id = ? AND view_type = ?').run(req.params.id, view_type);
  const id = uuidv4();
  const imageUrl = `/uploads/${req.file.filename}`;
  db.prepare('INSERT INTO character_images (id, character_id, view_type, image_url) VALUES (?, ?, ?, ?)').run(id, req.params.id, view_type, imageUrl);
  res.json({ id, character_id: req.params.id, view_type, image_url: imageUrl });
});

router.delete('/:id/images/:imageId', authMiddleware, (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)) return res.status(404).json({ error: 'Charakter nicht gefunden' });
  db.prepare('DELETE FROM character_images WHERE id = ? AND character_id = ?').run(req.params.imageId, req.params.id);
  res.json({ message: 'Bild gelöscht' });
});

function parseImages(rawStr) {
  if (!rawStr) return [];
  return rawStr.split(',').map(item => { const [view_type, image_url] = item.split('::'); return { view_type, image_url }; }).filter(i => i.view_type && i.image_url);
}

module.exports = router;
