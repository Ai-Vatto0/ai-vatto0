const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { adminCoinAddSchema, adminCoinRemoveSchema, adminUserCreateSchema } = require('../validation/schemas');
const { adminLimiter } = require('../middleware/rateLimit');

const router = express.Router();
router.use(authMiddleware, adminOnly, adminLimiter);

router.get('/users', (req, res) => {
  const users = getDb().prepare('SELECT id, username, email, coins, is_admin, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users.map(u => ({ ...u, is_admin: u.is_admin === 1 })));
});

router.post('/users', validate(adminUserCreateSchema), (req, res) => {
  const { username, email, password, coins, is_admin } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Alle Felder erforderlich' });
  if (password.length < 6) return res.status(400).json({ error: 'Passwort min. 6 Zeichen' });
  const db = getDb();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())) return res.status(409).json({ error: 'E-Mail bereits vergeben' });
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, email, password_hash, coins, is_admin) VALUES (?, ?, ?, ?, ?, ?)').run(id, username, email.toLowerCase(), bcrypt.hashSync(password, 10), parseInt(coins) || 0, is_admin ? 1 : 0);
  res.status(201).json({ id, username, email: email.toLowerCase(), coins: parseInt(coins) || 0, is_admin: !!is_admin });
});

router.post('/coins/add', validate(adminCoinAddSchema), (req, res) => {
  const { userId, amount, description } = req.body;
  if (!userId || !amount || parseInt(amount) <= 0) return res.status(400).json({ error: 'userId und positive Menge erforderlich' });
  const db = getDb();
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(userId)) return res.status(404).json({ error: 'User nicht gefunden' });
  const coins = parseInt(amount);
  db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coins, userId);
  db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description, admin_id) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), userId, coins, 'credit', description || 'Coins von Admin', req.user.id);
  res.json({ message: `${coins} Coins hinzugefügt`, new_balance: db.prepare('SELECT coins FROM users WHERE id = ?').get(userId).coins });
});

router.post('/coins/remove', validate(adminCoinRemoveSchema), (req, res) => {
  const { userId, amount, description } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'userId und amount erforderlich' });
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User nicht gefunden' });
  const newBalance = Math.max(0, user.coins - parseInt(amount));
  db.prepare('UPDATE users SET coins = ? WHERE id = ?').run(newBalance, userId);
  db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description, admin_id) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), userId, -parseInt(amount), 'debit', description || 'Coins entfernt', req.user.id);
  res.json({ message: 'Coins entfernt', new_balance: newBalance });
});

router.put('/users/:id/reset-password', (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Min. 6 Zeichen' });
  if (!getDb().prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'User nicht gefunden' });
  getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.params.id);
  res.json({ message: 'Passwort zurückgesetzt' });
});

router.delete('/users/:id', (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Kannst dich nicht selbst löschen' });
  getDb().prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User gelöscht' });
});

router.get('/stats', (req, res) => {
  const db = getDb();
  res.json({
    totalUsers: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    totalGenerations: db.prepare('SELECT COUNT(*) as c FROM video_jobs').get().c,
    totalCoinsDistributed: db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM coin_transactions WHERE type='credit'").get().t,
    totalCoinsSpent: db.prepare("SELECT COALESCE(SUM(ABS(amount)),0) as t FROM coin_transactions WHERE type='debit'").get().t,
    pendingJobs: db.prepare("SELECT COUNT(*) as c FROM video_jobs WHERE status IN ('processing','pending')").get().c,
  });
});

module.exports = router;
