const LoginAttempt = require("../models/LoginAttempt.model");

// Configuration
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS_PER_EMAIL: 5, // Max failed attempts per email
  MAX_ATTEMPTS_PER_IP: 10, // Max failed attempts per IP
  LOCKOUT_DURATION_MINUTES: 15, // Lock duration after max attempts
  ATTEMPT_WINDOW_MINUTES: 15, // Time window to count attempts
};

// Track login attempt
const trackLoginAttempt = async (
  email,
  ip,
  success,
  reason = null,
  userAgent = null,
) => {
  try {
    const expiresAt = new Date(
      Date.now() + RATE_LIMIT_CONFIG.ATTEMPT_WINDOW_MINUTES * 60 * 1000,
    );

    await LoginAttempt.create({
      email,
      ip,
      success,
      reason,
      userAgent,
      expiresAt,
    });
  } catch (error) {
    console.error("Error tracking login attempt:", error);
  }
};

// Check if account or IP is locked due to too many failed attempts
const checkBruteForce = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_CONFIG.ATTEMPT_WINDOW_MINUTES * 60 * 1000,
    );

    // Check failed attempts by email
    const emailAttempts = await LoginAttempt.countDocuments({
      email,
      success: false,
      createdAt: { $gte: windowStart },
    });

    if (emailAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_EMAIL) {
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Account locked for ${RATE_LIMIT_CONFIG.LOCKOUT_DURATION_MINUTES} minutes.`,
        lockoutMinutes: RATE_LIMIT_CONFIG.LOCKOUT_DURATION_MINUTES,
      });
    }

    // Check failed attempts by IP
    const ipAttempts = await LoginAttempt.countDocuments({
      ip,
      success: false,
      createdAt: { $gte: windowStart },
    });

    if (ipAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS_PER_IP) {
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts from this IP. Please try again later.`,
        lockoutMinutes: RATE_LIMIT_CONFIG.LOCKOUT_DURATION_MINUTES,
      });
    }

    next();
  } catch (error) {
    console.error("Error checking brute force:", error);
    next(); // Don't block login on error, but log it
  }
};

// Rate limiting for API endpoints
const createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean up old entries
    for (const [key, data] of requests.entries()) {
      if (now - data.timestamp > windowMs) {
        requests.delete(key);
      }
    }

    const clientData = requests.get(ip);

    if (!clientData) {
      requests.set(ip, { count: 1, timestamp: now });
      return next();
    }

    if (now - clientData.timestamp > windowMs) {
      requests.set(ip, { count: 1, timestamp: now });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    clientData.count++;
    next();
  };
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (req, res, next) => {
  // Remove any potential MongoDB operators from input
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.startsWith("$")) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

module.exports = {
  trackLoginAttempt,
  checkBruteForce,
  createRateLimiter,
  sanitizeInput,
  RATE_LIMIT_CONFIG,
};
