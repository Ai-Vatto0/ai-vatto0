/**
 * Fetch wrapper for all /api/* Vercel Serverless Functions
 */

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

/**
 * Start video generation
 * @param {{ imageData: string, prompt: string, aspectRatio: string }} params
 * @returns {Promise<{ taskId: string, creditsCost: number }>}
 */
export async function generateVideo({ imageData, prompt, aspectRatio }) {
  return request('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ imageData, prompt, aspectRatio }),
  })
}

/**
 * Check task status
 * @param {string} taskId
 * @returns {Promise<{ status: string, progress: number, result_url: string|null, error_message: string|null }>}
 */
export async function checkStatus(taskId) {
  return request('/api/check-status', {
    method: 'POST',
    body: JSON.stringify({ taskId }),
  })
}

/**
 * Get current credit balance
 * @returns {Promise<{ left_credits: number, is_vip: boolean }>}
 */
export async function getCredits() {
  return request('/api/credits')
}
