// Storage keys
export const STORAGE_KEYS = {
  IMAGES: 'sora_images',
  PROMPTS: 'sora_prompts',
  VIDEOS: 'sora_videos',
}

// Storage limits
export const MAX_IMAGES = 10
export const MAX_PROMPTS = 20
export const MAX_VIDEOS = 25
export const CREDITS_PER_VIDEO = 150

// Video status
export const STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
}

// Aspect ratios — API expects "portrait" or "landscape"
export const ASPECT_RATIOS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
}

/**
 * @typedef {{ id: string, base64: string, thumbnail: string, uploadedAt: string, usedCount: number }} StoredImage
 * @typedef {{ id: string, text: string, usedCount: number, createdAt: string }} StoredPrompt
 * @typedef {{ id: string, imageId: string, prompt: string, aspectRatio: string, videoUrl: string, generatedAt: string, credits: number, status: string }} StoredVideo
 */
