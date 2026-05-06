const express = require('express');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/balance', authMiddleware, (req, res) => {
  res.json({ coins: getDb().prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id).coins });
});

router.get('/history', authMiddleware, (req, res) => {
  res.json(getDb().prepare('SELECT * FROM coin_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.user.id));
});

module.exports = router;
