require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/database/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    initDatabase();
    console.log('✅ Datenbank bereit');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`📱 Erreichbar unter: http://localhost:${PORT}`);
      console.log(`🔑 Admin: ${process.env.ADMIN_EMAIL}`);
    });
  } catch (err) {
    console.error('❌ Server-Start fehlgeschlagen:', err);
    process.exit(1);
  }
}

start();
