const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const TokenBlacklist = require("../models/TokenBlacklist.model");

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Please login.",
    });
  }

  try {
    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token hasn't expired (additional check)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    // Get user from token
    const user = await User.findById(decoded.id).select("+lastPasswordChange");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token may be invalid.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact administrator.",
      });
    }

    // Check if password was changed after token was issued
    if (user.lastPasswordChange && decoded.iat) {
      const passwordChangedAt = Math.floor(
        user.lastPasswordChange.getTime() / 1000,
      );
      if (passwordChangedAt > decoded.iat) {
        return res.status(401).json({
          success: false,
          message: "Password was recently changed. Please login again.",
        });
      }
    }

    // Add user and token to request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Authentication failed.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please login again.",
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
