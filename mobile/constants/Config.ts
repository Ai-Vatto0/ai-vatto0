// Backend URL - HIER anpassen wenn der Server woanders läuft
// Für lokale Tests mit Expo Go: IP-Adresse des PCs statt localhost
export const API_BASE_URL = 'http://192.168.178.109:3000/api';
// Beispiel: 'http://192.168.1.50:3000/api'
// Für Produktion: 'https://deine-domain.com/api'

export const COIN_COSTS = {
  grok_6s_480p: 10,
  grok_6s_720p: 20,
  grok_10s_480p: 20,
  grok_10s_720p: 30,
  grok_15s_480p: 30,
  grok_15s_720p: 40,
  sora2_10s: 30,
  sora2_15s: 35,
  veo31_8s: 60,
  nano_banana_2k: 18,
  nano_banana_4k: 24,
  scene_generation: 5,
};

export const MODEL_LABELS: Record<string, string> = {
  grok: 'Grok Imagine',
  sora2: 'Sora 2',
  veo31: 'Veo 3.1 Fast',
};

export const MODEL_COLORS: Record<string, string> = {
  grok: '#06B6D4',
  sora2: '#7C3AED',
  veo31: '#10B981',
};
