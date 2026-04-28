const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  hashedOTP: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification',
    index: true,
  },
}, {
  timestamps: true,
});

// Auto-delete expired OTPs (TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.model('OTP', otpSchema);

module.exports = otpModel;

