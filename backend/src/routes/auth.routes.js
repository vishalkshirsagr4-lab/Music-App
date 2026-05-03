const express = require('express');
const multer = require('multer');
const passport = require('passport');
const authController = require("../controllers/auth.controller");
const { authAny } = require("../middlewares/auth.middleware");

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
router.get('/me', authAny, authController.getMe);
router.put('/me', authAny, upload.single('avatar'), authController.updateMe);
router.post('/request-artist', authAny, authController.requestArtist);

// Forgot password OTP (keep for password fallback)
router.post('/forgot-password/send-otp', authController.sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', authController.verifyForgotPasswordOTP);
router.post('/forgot-password/reset', authController.resetPassword);

module.exports = router;
