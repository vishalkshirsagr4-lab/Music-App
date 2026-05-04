const express = require('express');
const multer = require('multer');
const passport = require('passport');
const authController = require("../controllers/auth.controller");
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Google OAuth routes (public)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: 'http://localhost:5173/login?error=auth-failed' 
  }), 
  authController.googleCallback
);

// API routes (/api/auth/...)
router.post('/logout', authController.logoutUser);
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, upload.single('avatar'), authController.updateMe);
router.post('/request-artist', authMiddleware, authController.requestArtist);

// Forgot password OTP (keep for password fallback)
router.post('/forgot-password/send-otp', authController.sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', authController.verifyForgotPasswordOTP);
router.post('/forgot-password/reset', authController.resetPassword);

// Protected routes per spec
router.get('/admin/dashboard', authMiddleware, isAdmin, authController.adminDashboard);
router.get('/user/profile', authMiddleware, authController.userProfile);

module.exports = router;
