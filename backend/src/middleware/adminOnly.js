const { getDb } = require('../database/db');

function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Nur Admins haben Zugriff' });
  }

  // Check if user is banned (fresh from DB to prevent stale token exploits)
  const freshUser = getDb().prepare('SELECT is_banned FROM users WHERE id = ?').get(req.user.id);
  if (!freshUser || freshUser.is_banned) {
    return res.status(403).json({ error: 'Zugang gesperrt — Account ist gebannt' });
  }

  next();
}

module.exports = adminOnly;
