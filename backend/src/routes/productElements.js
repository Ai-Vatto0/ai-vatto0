const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function normalizeElementName(value, fallback) {
  return String(value || fallback || 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

function parseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    element_name: row.element_name,
    description: row.description,
    reference_images: JSON.parse(row.reference_images || '[]'),
    product_lock: JSON.parse(row.product_lock || '{}'),
    source_notes: row.source_notes || '',
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function validateRefs(referenceImages) {
  if (!Array.isArray(referenceImages) || referenceImages.length < 2 || referenceImages.length > 4) {
    return 'Ein Produkt-Element braucht 2-4 Referenzbilder';
  }
  for (const url of referenceImages) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return 'Referenzbilder muessen HTTP(S)-URLs sein';
    } catch {
      return 'Referenzbilder muessen gueltige URLs sein';
    }
  }
  return null;
}

// List active product elements. Add ?all=1 to include deactivated records.
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const includeAll = req.query.all === '1';
  const rows = includeAll
    ? db.prepare('SELECT * FROM product_elements WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id)
    : db.prepare('SELECT * FROM product_elements WHERE user_id = ? AND is_active = 1 ORDER BY updated_at DESC').all(req.user.id);
  res.json(rows.map(parseRow));
});

router.get('/:id', authMiddleware, (req, res) => {
  const row = getDb().prepare('SELECT * FROM product_elements WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Produkt-Element nicht gefunden' });
  res.json(parseRow(row));
});

// Save a reusable product identity. KIE receives these refs again on every render.
router.post('/', authMiddleware, (req, res) => {
  const {
    name,
    slug,
    elementName,
    description,
    referenceImages,
    productLock,
    sourceNotes,
  } = req.body;

  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name ist erforderlich' });
  const refError = validateRefs(referenceImages);
  if (refError) return res.status(400).json({ error: refError });

  const finalSlug = normalizeSlug(slug || name);
  const finalElementName = normalizeElementName(elementName, finalSlug.replace(/-/g, '_'));
  if (!finalSlug || !finalElementName) return res.status(400).json({ error: 'Slug/Elementname ist ungueltig' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM product_elements WHERE user_id = ? AND slug = ?').get(req.user.id, finalSlug);
  if (existing) return res.status(409).json({ error: 'Produkt-Slug existiert bereits', id: existing.id });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO product_elements (
      id, user_id, slug, name, element_name, description,
      reference_images, product_lock, source_notes, is_active, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
  `).run(
    id,
    req.user.id,
    finalSlug,
    String(name).trim(),
    finalElementName,
    String(description || name).trim(),
    JSON.stringify(referenceImages),
    JSON.stringify(productLock || {}),
    String(sourceNotes || '').slice(0, 2000)
  );

  const row = db.prepare('SELECT * FROM product_elements WHERE id = ?').get(id);
  res.status(201).json(parseRow(row));
});

router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const current = db.prepare('SELECT * FROM product_elements WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!current) return res.status(404).json({ error: 'Produkt-Element nicht gefunden' });

  const nextName = req.body.name !== undefined ? String(req.body.name).trim() : current.name;
  const nextSlug = req.body.slug !== undefined ? normalizeSlug(req.body.slug) : current.slug;
  const nextElementName = req.body.elementName !== undefined
    ? normalizeElementName(req.body.elementName)
    : current.element_name;
  const nextDescription = req.body.description !== undefined ? String(req.body.description).trim() : current.description;
  const nextRefs = req.body.referenceImages !== undefined ? req.body.referenceImages : JSON.parse(current.reference_images || '[]');
  const nextLock = req.body.productLock !== undefined ? req.body.productLock : JSON.parse(current.product_lock || '{}');
  const nextNotes = req.body.sourceNotes !== undefined ? String(req.body.sourceNotes).slice(0, 2000) : current.source_notes;
  const nextActive = req.body.isActive !== undefined ? (req.body.isActive ? 1 : 0) : current.is_active;

  if (!nextName || !nextSlug || !nextElementName) return res.status(400).json({ error: 'Name, Slug und Elementname duerfen nicht leer sein' });
  const refError = validateRefs(nextRefs);
  if (refError) return res.status(400).json({ error: refError });

  const slugOwner = db.prepare('SELECT id FROM product_elements WHERE user_id = ? AND slug = ? AND id != ?').get(req.user.id, nextSlug, current.id);
  if (slugOwner) return res.status(409).json({ error: 'Produkt-Slug existiert bereits', id: slugOwner.id });

  db.prepare(`
    UPDATE product_elements
    SET slug=?, name=?, element_name=?, description=?, reference_images=?, product_lock=?, source_notes=?, is_active=?, updated_at=datetime('now')
    WHERE id=? AND user_id=?
  `).run(
    nextSlug,
    nextName,
    nextElementName,
    nextDescription,
    JSON.stringify(nextRefs),
    JSON.stringify(nextLock || {}),
    nextNotes,
    nextActive,
    current.id,
    req.user.id
  );

  res.json(parseRow(db.prepare('SELECT * FROM product_elements WHERE id = ?').get(current.id)));
});

// Soft-delete so historic jobs can still be traced.
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const result = db.prepare("UPDATE product_elements SET is_active=0, updated_at=datetime('now') WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ error: 'Produkt-Element nicht gefunden' });
  res.json({ message: 'Produkt-Element deaktiviert', id: req.params.id });
});

module.exports = router;
