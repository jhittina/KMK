const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
      default: false,
    },
    userAgent: String,
    reason: String, // e.g., "invalid_password", "user_not_found", "account_locked"
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
loginAttemptSchema.index({ email: 1, ip: 1, createdAt: -1 });
loginAttemptSchema.index({ ip: 1, createdAt: -1 });

const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);

module.exports = LoginAttempt;
