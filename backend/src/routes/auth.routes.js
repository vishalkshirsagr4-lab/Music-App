const express = require('express');
const multer = require('multer');
const authController = require("../controllers/auth.controller")
const { authAny } = require("../middlewares/auth.middleware")

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/register', upload.single('avatar'), authController.registerUser)
router.put('/me', authAny, upload.single('avatar'), authController.updateMe)
router.post('/login', authController.loginUser)
router.post('/logout', authController.logoutUser)
router.post('/send-otp', authController.sendOTP)
router.post('/verify-otp', authController.verifyOTP)
router.get('/me', authAny, authController.getMe)
router.post('/request-artist', authAny, authController.requestArtist)
router.post('/forgot-password/send-otp', authController.sendForgotPasswordOTP)
router.post('/forgot-password/verify-otp', authController.verifyForgotPasswordOTP)
router.post('/forgot-password/reset', authController.resetPassword)

module.exports = router;
