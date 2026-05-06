import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import express from 'express'

const __dir = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dir, '.env.local') })

const app = express()
const PORT = process.env.PORT || 3000
const API_KEY = process.env.SORA_API_KEY

app.use(express.json({ limit: '20mb' }))

// ── Serve React build ──────────────────────────────────────────────
app.use(express.static(join(__dir, 'dist')))

// ── Helper ─────────────────────────────────────────────────────────
function authHeaders() {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Origin': 'https://freesoragenerator.com',
    'Referer': 'https://freesoragenerator.com/',
  }
}

// ── POST /api/generate ─────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { imageData, prompt, aspectRatio } = req.body
  if (!imageData || !prompt) return res.status(400).json({ error: 'imageData and prompt required' })

  const apiAspectRatio = aspectRatio === 'portrait' ? 'portrait' : 'landscape'

  try {
    const r = await fetch('https://freesoragenerator.com/api/v1/video/sora-pro', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'sora-2-image-to-video',
        prompt,
        imageData,
        aspectRatio: apiAspectRatio,
        nFrames: 15,
        removeWatermark: true,
        isPublic: false,
      }),
    })

    const data = await r.json()
    if (!r.ok || data.code !== 0) {
      return res.status(502).json({ error: data.message ?? 'Generation failed', code: data.code })
    }

    const taskId = data.data?.taskId
    if (!taskId) return res.status(502).json({ error: 'No taskId returned', raw: data })

    res.json({ taskId, creditsCost: 150 })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// ── POST /api/check-status ─────────────────────────────────────────
app.post('/api/check-status', async (req, res) => {
  const { taskId } = req.body
  if (!taskId) return res.status(400).json({ error: 'taskId required' })

  try {
    const r = await fetch('https://freesoragenerator.com/api/video-generations/check-result', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ taskId }),
    })

    const data = await r.json()
    if (!r.ok || data.code !== 0) {
      return res.status(502).json({ error: data.message ?? 'Status check failed' })
    }

    const p = data.data ?? data
    const result_url = p.result_url
      ?? (Array.isArray(p.result_urls) ? p.result_urls[0] : null)
      ?? null

    res.json({
      status:        p.status ?? 'pending',
      progress:      p.progress ?? 0,
      result_url,
      error_message: p.failure_reason ?? null,
    })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// ── GET /api/credits ───────────────────────────────────────────────
app.get('/api/credits', async (req, res) => {
  try {
    const r = await fetch('https://freesoragenerator.com/api/get-user-credits', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    })

    const data = await r.json()
    if (!r.ok || data.code !== 0) {
      return res.status(502).json({ error: data.message ?? 'Credits fetch failed' })
    }

    const p = data.data ?? data
    res.json({ left_credits: p.left_credits ?? 0, is_vip: p.is_vip ?? false })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// ── SPA fallback ───────────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dir, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n SORA WARRIOR running on http://localhost:${PORT}`)
  console.log(` On your phone (same WiFi): http://192.168.178.109:${PORT}`)
  console.log(` API_KEY: ${API_KEY ? 'loaded' : 'MISSING!'}\n`)
})
