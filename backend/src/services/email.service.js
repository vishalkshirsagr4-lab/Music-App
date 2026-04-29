const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'vishalkshirsagr4@gmail.com',
    pass: process.env.EMAIL_PASS || 'kmpw hykv ewsl tksr',
  },
});

async function sendOTPEmail(to, otp) {
  console.log('🚀 Sending OTP email to:', to);
  
  const mailOptions = {
    from: `"Music App" <vishalkshirsagr4@gmail.com>`,
    to,
    subject: 'Your Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #1db954;">Verify Your Email</h2>
        <p style="color: #333;">Use the following One-Time Password (OTP) to verify your email address. This code will expire in <strong>5 minutes</strong>.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px 0; color: #1db954;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    console.log('📤 Sending mail...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw error;
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  console.log('🔄 Sending reset email to:', to);
  
  const mailOptions = {
    from: `"Music App" <vishalkshirsagr4@gmail.com>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #1db954;">Reset Your Password</h2>
        <p style="color: #333;">You requested a password reset. Use the following One-Time Password (OTP) to proceed. This code will expire in <strong>5 minutes</strong>.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px 0; color: #1db954;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Reset email failed:', error.message);
    throw error;
  }
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
