export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  // Credits endpoint requires POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.SORA_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  try {
    const response = await fetch('https://freesoragenerator.com/api/get-user-credits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const data = await response.json()

    if (!response.ok || data.code !== 0) {
      console.error('[credits] upstream error:', response.status, data)
      return res.status(502).json({ error: data.message ?? 'Failed to fetch credits' })
    }

    const payload = data.data ?? data
    const left_credits = payload.left_credits ?? 0
    const is_vip       = payload.is_vip ?? false

    return res.status(200).json({ left_credits, is_vip })
  } catch (err) {
    console.error('[credits] error:', err)
    return res.status(502).json({ error: 'Failed to fetch credits', message: err.message })
  }
}
