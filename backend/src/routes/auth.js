const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { sendMagicLink, verifyMagicLink } = require('../services/emailService');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Falsche E-Mail oder Passwort' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Falsche E-Mail oder Passwort' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, coins: user.coins, is_admin: user.is_admin === 1 } });
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, coins, is_admin, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ ...user, is_admin: user.is_admin === 1 });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Alle Felder erforderlich' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Min. 6 Zeichen' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) return res.status(401).json({ error: 'Aktuelles Passwort falsch' });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
  res.json({ message: 'Passwort geändert' });
});

// Magic Link versenden
router.post('/send-magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-Mail erforderlich' });

    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    // User erstellen falls nicht existiert
    if (!user) {
      const userId = uuidv4();
      const defaultPasswordHash = bcrypt.hashSync(uuidv4(), 10); // Random temp password

      db.prepare(`
        INSERT INTO users (id, username, email, password_hash, coins)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, email.split('@')[0], email.toLowerCase(), defaultPasswordHash, 400);

      user = { id: userId, email: email.toLowerCase() };
    }

    // Magic Link versenden
    await sendMagicLink(email.toLowerCase());
    res.json({ message: 'Magic Link wurde versendet', email: email.toLowerCase() });
  } catch (error) {
    console.error('❌ Magic Link Fehler:', error);
    res.status(500).json({ error: error.message || 'Magic Link versand fehlgeschlagen' });
  }
});

// Magic Link verifizieren & Login
router.post('/verify-magic-link', (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ error: 'E-Mail und Token erforderlich' });

    // Token verifizieren
    const link = verifyMagicLink(email.toLowerCase(), token);
    if (!link) return res.status(401).json({ error: 'Ungültiger oder abgelaufener Link' });

    // User laden
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'User nicht gefunden' });

    // JWT Token erstellen
    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        is_admin: user.is_admin === 1
      }
    });
  } catch (error) {
    console.error('❌ Verifizierung Fehler:', error);
    res.status(500).json({ error: 'Verifizierung fehlgeschlagen' });
  }
});

module.exports = router;
