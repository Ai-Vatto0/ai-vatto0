const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');

let resendInstance;
function getResend() {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Magic Link Token speichern (gültig für 15 Minuten)
function generateMagicLink(email) {
  const token = uuidv4();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min

  const db = getDb();
  db.prepare(`
    INSERT INTO magic_links (email, token, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(email.toLowerCase(), token, expiresAt, new Date().toISOString());

  return { token, expiresAt };
}

// Magic Link verifizieren
function verifyMagicLink(email, token) {
  const db = getDb();
  const link = db.prepare(`
    SELECT * FROM magic_links
    WHERE email = ? AND token = ? AND expires_at > ?
  `).get(email.toLowerCase(), token, Date.now());

  if (!link) return null;

  // Token löschen nach Verifizierung
  db.prepare('DELETE FROM magic_links WHERE id = ?').run(link.id);

  return link;
}

// Email versenden
async function sendMagicLink(email) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY nicht konfiguriert');
  }
  const { token } = generateMagicLink(email);

  const magicLink = `${process.env.FRONTEND_URL || 'https://snova-studio.vercel.app'}/auth/magic?email=${encodeURIComponent(email)}&token=${token}`;

  try {
    const response = await getResend().emails.send({
      from: 'Snova Studio <onboarding@resend.dev>',
      to: email,
      subject: '🎨 Dein Snova Studio Magic Link',
      html: `
        <div style="font-family: 'Outfit', sans-serif; background: #08061A; color: #fff; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF2D78; font-size: 24px; margin-bottom: 20px;">Willkommen zu Snova Studio!</h1>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Klick auf den Button unten, um dich anzumelden:
            </p>

            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #FF2D78, #7B4FFF); color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 30px;">
              🔓 Anmelden
            </a>

            <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #1E1A3A; padding-top: 20px;">
              Dieser Link ist 15 Minuten lang gültig.
            </p>

            <p style="font-size: 12px; color: #666;">
              Falls du diese E-Mail nicht angefordert hast, ignoriere sie einfach.
            </p>
          </div>
        </div>
      `
    });

    return { success: true, response };
  } catch (error) {
    console.error('❌ Email versand fehlgeschlagen:', error);
    throw new Error(`Email versand fehlgeschlagen: ${error.message}`);
  }
}

module.exports = {
  sendMagicLink,
  verifyMagicLink,
  generateMagicLink
};
