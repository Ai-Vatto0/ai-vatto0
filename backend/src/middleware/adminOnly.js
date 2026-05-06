function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Nur Admins haben Zugriff' });
  }
  next();
}

module.exports = adminOnly;
