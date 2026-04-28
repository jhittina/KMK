const logger = require("../config/logger");

/**
 * Middleware that intercepts all JSON responses.
 * Any response with status >= 400 is automatically logged to MongoDB.
 */
const errorLogger = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 400) {
      const message = body?.message || body?.error || `HTTP ${res.statusCode}`;

      logger.error(message, {
        meta: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userId: req.user?.id || null,
          userEmail: req.user?.email || null,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          body: body,
        },
      });
    }

    return originalJson(body);
  };

  next();
};

module.exports = errorLogger;
