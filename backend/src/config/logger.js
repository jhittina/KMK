const { createLogger, format, transports } = require("winston");
require("winston-mongodb");

const { combine, timestamp, printf, colorize, errors } = format;

// Console log format
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: "error", // Only log errors and above
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
  ),
  transports: [
    // Console — colored output in development
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        consoleFormat,
      ),
    }),

    // MongoDB — persist error logs
    new transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: "error_logs",
      level: "error",
      storeHost: true,
      expireAfterSeconds: 7 * 24 * 60 * 60, // Auto-delete after 1 week
      options: { useUnifiedTopology: true },
      metaKey: "meta",
    }),
  ],
});

module.exports = logger;
