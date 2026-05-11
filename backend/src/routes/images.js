const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { generateImageWan27, generateImageNanaBanana, COIN_COSTS, checkKieCredits } = require('../services/kieai');
const { imageQueue } = require('../services/generationQueue');

const router = express.Router();

// Modelle: wan27 (Primary), nano_banana (Fallback)
router.post('/generate', authMiddleware, async (req, res) => {
  const { prompt, model, resolution, referenceImages, count, characterId, viewType } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt erforderlich' });

  const useModel = model === 'nano_banana' ? 'nano_banana' : 'wan27';
  const useResolution = resolution || '2k';
  const useCount = Math.min(parseInt(count) || 1, 12);
  const refs = Array.isArray(referenceImages) ? referenceImages : [];

  const coinCost = useModel === 'wan27'
    ? COIN_COSTS.wan27_image * useCount
    : (useResolution === '4k' ? COIN_COSTS.nano_banana_4k : COIN_COSTS.nano_banana_2k);

  const db = getDb();
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  if (user.coins < coinCost) return res.status(402).json({ error: `Nicht genug Coins. Benötigt: ${coinCost}` });

  // Kie.ai Credits prüfen
  const hasKieCredits = await checkKieCredits(30);
  if (!hasKieCredits) return res.status(503).json({ error: 'Service vorübergehend nicht verfügbar. Bitte später erneut versuchen.' });

  db.transaction(() => {
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(coinCost, req.user.id);
    db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.user.id, -coinCost, 'debit', `Bild: ${useModel} x${useCount}`);
  })();

  try {
    const result = await imageQueue.add(async () => {
      if (useModel === 'wan27') return generateImageWan27(prompt, refs, useCount);
      return generateImageNanaBanana(prompt, refs, useResolution);
    });

    // Charakter-Bild speichern wenn angegeben
    if (characterId && viewType && result.image_url) {
      const character = db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(characterId, req.user.id);
      if (character) {
        db.prepare('DELETE FROM character_images WHERE character_id = ? AND view_type = ?').run(characterId, viewType);
        db.prepare('INSERT INTO character_images (id, character_id, view_type, image_url) VALUES (?, ?, ?, ?)').run(uuidv4(), characterId, viewType, result.image_url);
      }
    }

    res.json({ ...result, coins_used: coinCost, model: useModel });
  } catch (err) {
    db.transaction(() => {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinCost, req.user.id);
      db.prepare('INSERT INTO coin_transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.user.id, coinCost, 'credit', 'Rückerstattung: Bild fehlgeschlagen');
    })();
    res.status(500).json({ error: 'Fehler: ' + err.message });
  }
});

router.get('/costs', authMiddleware, (req, res) => {
  res.json({
    wan27: COIN_COSTS.wan27_image,          // pro Bild
    nano_banana_2k: COIN_COSTS.nano_banana_2k,
    nano_banana_4k: COIN_COSTS.nano_banana_4k,
  });
});

module.exports = router;
