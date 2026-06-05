// ─────────────────────────────────────────────────────────────
// TokTok Shop Service Worker — minimale Offline-Shell.
// Strategie:
//   - App-Shell (HTML/JS/CSS) wird gecacht (Cache-First mit Netz-Update).
//   - API-/Function-Calls und Storage NIE cachen (immer Netz).
// Bei jedem Deploy CACHE_VERSION erhöhen, damit alte Shell verworfen wird.
// ─────────────────────────────────────────────────────────────
const CACHE_VERSION = 'toktok-v2'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Nur GET cachen. Niemals Supabase (Functions/Storage/REST) cachen.
  const isApi =
    url.pathname.includes('/functions/v1/') ||
    url.pathname.includes('/storage/v1/') ||
    url.pathname.includes('/rest/v1/')

  if (request.method !== 'GET' || isApi) {
    return // Browser-Default = Netz
  }

  // Navigationsanfragen → Netz zuerst, Fallback auf gecachte Shell (Offline)
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }

  // Statische Assets → Cache zuerst, im Hintergrund aktualisieren
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
