const express = require('express');
const cors = require('cors');
const path = require('path');
const { requestLogger, errorLogger } = require('./utils/logger');

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const storyRoutes = require('./routes/stories');
const videoRoutes = require('./routes/videos');
const imageRoutes = require('./routes/images');
const coinRoutes = require('./routes/coins');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
    : true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Structured request logging
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KI-App Backend läuft' });
});

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/admin', adminRoutes);

// Error logging (captures stack traces for request logger)
app.use(errorLogger);

app.use((err, req, res, next) => {
  console.error('Server-Fehler:', err);
  res.status(500).json({ error: 'Interner Server-Fehler' });
});

module.exports = app;
