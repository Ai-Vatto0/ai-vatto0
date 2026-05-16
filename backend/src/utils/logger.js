const pino = require('pino');
const { v4: uuidv4 } = require('uuid');

// Create pino logger with configurable log level
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino/file', options: { destination: 1 } } // stdout in dev (readable)
    : undefined, // structured JSON in production
  base: {
    service: 'snova-backend',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Request logging middleware.
 * Logs: method, url, status code, response time, user ID (if authenticated), request ID.
 * On 500 errors: logs error stack traces.
 */
function requestLogger(req, res, next) {
  // Generate a unique request ID
  const requestId = uuidv4().slice(0, 8);
  req.requestId = requestId;
  res.set('X-Request-Id', requestId);

  const startTime = Date.now();

  // Hook into response finish
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: responseTime,
      userId: req.user?.id || null,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      // Log 500 errors with stack trace if available
      logger.error({
        ...logData,
        error: res._errorForLog || null,
      }, `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`);
    } else {
      logger.info(logData, `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`);
    }

    originalEnd.apply(res, args);
  };

  next();
}

/**
 * Error logging middleware (use after routes, before generic error handler).
 * Captures error stack traces for the request logger.
 */
function errorLogger(err, req, res, next) {
  // Attach error info for the request logger
  res._errorForLog = {
    message: err.message,
    stack: err.stack,
    name: err.name,
  };

  logger.error({
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
  }, `Unhandled error: ${err.message}`);

  next(err);
}

module.exports = {
  logger,
  requestLogger,
  errorLogger,
};
