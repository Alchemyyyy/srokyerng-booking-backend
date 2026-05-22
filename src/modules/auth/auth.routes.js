const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const {
  loginRateLimit,
  forgotPasswordRateLimit,
  resetPasswordRateLimit,
  resendVerificationEmailRateLimit,
} = require("../../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", loginRateLimit, authController.login);
router.post("/forgot-password", forgotPasswordRateLimit, authController.forgotPassword);
router.post("/reset-password", resetPasswordRateLimit, authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/resend-verification-email",
  authMiddleware,
  resendVerificationEmailRateLimit,
  authController.resendVerificationEmail
);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", authMiddleware, authController.getMe);
router.get("/sessions", authMiddleware, authController.getSessions);
router.delete("/sessions/:id", authMiddleware, authController.revokeSession);
router.post("/logout", authMiddleware, authController.logout);
router.post("/logout-all", authMiddleware, authController.logoutAll);

module.exports = router;
