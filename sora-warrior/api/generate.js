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

  const { imageData, prompt, aspectRatio } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' })
  }

  // API expects "portrait" or "landscape"
  const apiAspectRatio = aspectRatio === 'portrait' ? 'portrait' : 'landscape'

  // Text-to-Video wenn kein Bild übergeben, sonst Image-to-Video
  const isTextToVideo = !imageData
  const body = {
    model: isTextToVideo ? 'sora-2-pro-text-to-video' : 'sora-2-image-to-video-stable',
    prompt,
    aspectRatio: apiAspectRatio,
    nFrames: '15',          // String, nicht Zahl — laut FSG AI Doku
    removeWatermark: true,
    isPublic: false,
    ...(isTextToVideo ? {} : { imageData }),
  }

  try {
    const response = await fetch('https://freesoragenerator.com/api/v1/video/sora-pro', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok || data.code !== 0) {
      console.error('[generate] upstream error:', response.status, data)
      return res.status(502).json({
        error: data.message ?? `Generation failed (${response.status})`,
        code: data.code,
      })
    }

    const taskId = data.data?.taskId
    if (!taskId) {
      console.error('[generate] No taskId in response:', data)
      return res.status(502).json({ error: 'No taskId returned', raw: data })
    }

    return res.status(200).json({ taskId, creditsCost: 150 })
  } catch (err) {
    console.error('[generate] error:', err)
    return res.status(502).json({ error: 'Generation request failed', message: err.message })
  }
}
