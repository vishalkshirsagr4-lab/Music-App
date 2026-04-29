const express = require('express');
const router = express.Router();
const { sendOTPEmail } = require('../services/email.service');

router.get('/test-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const testOtp = '123456';
    await sendOTPEmail(email, testOtp);
    res.json({ success: true, message: `Test OTP 123456 sent to ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/test', (req, res) => res.json({ status: 'Backend OK' }));

module.exports = router;
