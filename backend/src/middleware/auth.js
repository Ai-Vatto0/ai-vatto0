const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nicht autorisiert – kein Token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = getDb().prepare('SELECT id, username, email, coins, is_admin FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Benutzer nicht gefunden' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
}

module.exports = authMiddleware;
