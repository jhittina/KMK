const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  checkBruteForce,
  sanitizeInput,
} = require("../middleware/security.middleware");

// Public routes with security middleware
router.post("/register", sanitizeInput, authController.register);
router.post("/login", sanitizeInput, checkBruteForce, authController.login);

// Protected routes
router.get("/me", protect, authController.getMe);
router.post("/logout", protect, authController.logout);
router.post("/logout-all", protect, authController.logoutAll);
router.put(
  "/change-password",
  protect,
  sanitizeInput,
  authController.changePassword,
);

// Admin only routes
router.get("/users", protect, authorize("admin"), authController.getAllUsers);
router.put(
  "/users/:id",
  protect,
  authorize("admin"),
  sanitizeInput,
  authController.updateUser,
);
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  authController.deleteUser,
);

module.exports = router;
