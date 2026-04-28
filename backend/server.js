const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./src/config/database");
const logger = require("./src/config/logger");
const errorLogger = require("./src/middleware/errorLogger.middleware");
const {
  createRateLimiter,
  sanitizeInput,
} = require("./src/middleware/security.middleware");

const app = express();

// Trust proxy - important for rate limiting and IP tracking
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// Security Headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'",
  );
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");
  next();
});

// Rate limiting - Global
app.use(createRateLimiter(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes

// Middleware
app.use(express.json({ limit: "10mb" })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));

// Sanitize all inputs
app.use(sanitizeInput);

// Log all failed responses to MongoDB
app.use(errorLogger);

// Import Routes
const authRoutes = require("./src/routes/auth.routes");
const configRoutes = require("./src/routes/config.routes");
const workspaceRoutes = require("./src/routes/workspace.routes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/workspace", workspaceRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Karalaya API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
