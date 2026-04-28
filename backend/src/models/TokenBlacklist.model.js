const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["logout", "security", "expired", "compromised"],
      default: "logout",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - MongoDB will automatically delete when expiresAt is reached
    },
    ip: String,
    userAgent: String,
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
tokenBlacklistSchema.index({ token: 1, expiresAt: 1 });

const TokenBlacklist = mongoose.model("TokenBlacklist", tokenBlacklistSchema);

module.exports = TokenBlacklist;
