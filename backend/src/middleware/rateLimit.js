/**
 * In-memory sliding window rate limiter.
 *
 * Options:
 * - windowMs: time window in milliseconds (default: 60000 = 1 minute)
 * - maxRequests: maximum requests allowed in the window (default: 10)
 * - keyFn: function(req) => string key for grouping (default: IP address)
 * - message: custom error message (optional)
 */

// Store: Map<key, timestamp[]>
const stores = new Map();

function createRateLimiter({ windowMs = 60000, maxRequests = 10, keyFn, message } = {}) {
  const storeName = Symbol('rateLimit');
  stores.set(storeName, new Map());

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const store = stores.get(storeName);
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, valid);
      }
    }
  }, 5 * 60 * 1000);

  // Allow garbage collection if process exits
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimitMiddleware(req, res, next) {
    const store = stores.get(storeName);
    const now = Date.now();

    // Determine the rate limit key
    let key;
    if (keyFn) {
      key = keyFn(req);
    } else {
      // Default: use IP address
      key = req.ip || req.connection.remoteAddress || 'unknown';
    }

    // Get existing timestamps and filter to current window
    const timestamps = (store.get(key) || []).filter(t => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      // Calculate retry-after in seconds
      const oldestInWindow = timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      res.set('Retry-After', String(retryAfterSec));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil((oldestInWindow + windowMs) / 1000)));

      return res.status(429).json({
        error: message || 'Zu viele Anfragen. Bitte spaeter erneut versuchen.',
        retryAfter: retryAfterSec,
      });
    }

    // Record this request
    timestamps.push(now);
    store.set(key, timestamps);

    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - timestamps.length));

    next();
  };
}

// Pre-configured rate limiters for common use cases
const authLoginLimiter = createRateLimiter({
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 5,         // 5 attempts per minute per IP
  message: 'Zu viele Login-Versuche. Bitte eine Minute warten.',
});

const videoGenerateLimiter = createRateLimiter({
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 3,         // 3 generations per minute per user
  keyFn: (req) => `user:${req.user?.id || req.ip}`,
  message: 'Zu viele Video-Generierungen. Bitte eine Minute warten.',
});

const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 30,        // 30 requests per minute per user
  keyFn: (req) => `admin:${req.user?.id || req.ip}`,
  message: 'Zu viele Admin-Anfragen. Bitte kurz warten.',
});

module.exports = {
  createRateLimiter,
  authLoginLimiter,
  videoGenerateLimiter,
  adminLimiter,
};
