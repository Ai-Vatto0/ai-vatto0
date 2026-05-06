export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.SORA_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  const { taskId } = req.body
  if (!taskId) return res.status(400).json({ error: 'taskId is required' })

  try {
    const response = await fetch('https://freesoragenerator.com/api/video-generations/check-result', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId }),
    })

    const data = await response.json()

    if (!response.ok || data.code !== 0) {
      console.error('[check-status] upstream error:', response.status, data)
      return res.status(502).json({ error: data.message ?? 'Status check failed' })
    }

    const payload = data.data ?? data

    // Status values: pending | running | succeeded | failed | cancelled
    const status = payload.status ?? 'pending'

    // Video URL
    const result_url = payload.result_url
      ?? (Array.isArray(payload.result_urls) ? payload.result_urls[0] : null)
      ?? null

    const progress   = payload.progress ?? 0
    const error_message = payload.failure_reason ?? null

    return res.status(200).json({ status, progress, result_url, error_message })
  } catch (err) {
    console.error('[check-status] error:', err)
    return res.status(502).json({ error: 'Status check failed', message: err.message })
  }
}
