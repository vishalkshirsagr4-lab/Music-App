const express = require('express');
const multer = require('multer');
const passport = require('passport');
const authController = require("../controllers/auth.controller");
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Google OAuth routes (public)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'https://music-app-chi-opal.vercel.app/login'
  }),
  (req, res) => {
    const user = req.user;
    const jwt = require('jsonwebtoken');

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.redirect(
      `https://music-app-chi-opal.vercel.app/login/success?token=${token}&role=${user.role}`
    );
  }
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
