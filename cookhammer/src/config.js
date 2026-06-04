// ─────────────────────────────────────────────────────────────
// Zentrale Konfiguration. Liest VITE_* aus .env.local.
// Wirft früh einen klaren Fehler, wenn Pflicht-Variablen fehlen,
// statt später kryptisch beim Fetch zu scheitern.
// ─────────────────────────────────────────────────────────────
export const CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  bucket: import.meta.env.VITE_SUPABASE_BUCKET || 'cookhammer-uploads',
  // Standard-Auflösung für kie.ai/Grok (Edge Function default = 480p)
  resolution: import.meta.env.VITE_GROK_RESOLUTION || '720p',
  fn: {
    // ⚠️ ACHTUNG: Bei diesem Projekt sind die Function-Slugs INVERTIERT zu ihrer Funktion:
    //   'get-grok-task'    ERSTELLT den Task   (POST /jobs/createTask)
    //   'create-grok-task' PRÜFT den Status     (GET  /jobs/recordInfo)
    createTask: import.meta.env.VITE_FN_CREATE_TASK || 'get-grok-task',
    getTask: import.meta.env.VITE_FN_GET_TASK || 'create-grok-task',
    analyze: import.meta.env.VITE_FN_ANALYZE || 'analyze-image',
  },
}

// Basis-URL für Edge Functions
export const fnUrl = (name) => `${CONFIG.supabaseUrl}/functions/v1/${name}`

// Standard-Header für authentifizierte Supabase-Aufrufe (anon-Key reicht hier)
export const supaHeaders = (extra = {}) => ({
  apikey: CONFIG.anonKey,
  Authorization: `Bearer ${CONFIG.anonKey}`,
  ...extra,
})

// Prüft Konfiguration. Gibt Liste fehlender Variablen zurück (leer = ok).
export function missingConfig() {
  const missing = []
  if (!CONFIG.supabaseUrl || CONFIG.supabaseUrl.includes('DEIN-PROJEKT')) missing.push('VITE_SUPABASE_URL')
  if (!CONFIG.anonKey || CONFIG.anonKey === 'dein_anon_key_hier') missing.push('VITE_SUPABASE_ANON_KEY')
  return missing
}
