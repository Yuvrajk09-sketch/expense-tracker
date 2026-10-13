/**
 * Sliding Window Log Rate Limiter Middleware
 * 
 * Tracks timestamps of requests for each client (by IP or custom key) in a rolling window.
 * Eliminates the "window boundary burst" problem found in fixed-window limiters.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Window size in milliseconds
 * @param {number} options.max - Maximum requests allowed per window
 * @param {string|Object} options.message - Error response sent when rate limit is exceeded
 * @param {Function} [options.keyGenerator] - Function to extract unique client key (defaults to IP)
 * @returns {Function} Express middleware
 */
function createSlidingWindowLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 10,
    message = { message: 'Too many requests. Please try again later.' },
    keyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown',
  } = options;

  // In-memory store: Map<clientKey, Array<timestamp>>
  const store = new Map();

  // Periodic cleanup to avoid memory leaks from inactive clients
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const activeTimestamps = timestamps.filter((t) => now - t < windowMs);
      if (activeTimestamps.length === 0) {
        store.delete(key);
      } else {
        store.set(key, activeTimestamps);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));

  if (cleanupTimer.unref) {
    cleanupTimer.unref(); // Prevent timer from keeping Node process alive
  }

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Retrieve previous timestamps and keep only those inside the rolling window
    const existing = store.get(key) || [];
    const validTimestamps = existing.filter((t) => t > windowStart);

    if (validTimestamps.length >= max) {
      // Oldest timestamp in window dictates when the next request is allowed
      const oldestTimestamp = validTimestamps[0];
      const resetTimeMs = oldestTimestamp + windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', 0);
      res.setHeader('RateLimit-Reset', Math.ceil(resetTimeMs / 1000));

      const payload = typeof message === 'string' ? { message } : message;
      return res.status(429).json(payload);
    }

    // Add current request timestamp
    validTimestamps.push(now);
    store.set(key, validTimestamps);

    const remaining = max - validTimestamps.length;
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    next();
  };
}

module.exports = createSlidingWindowLimiter;
