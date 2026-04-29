const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendOTPEmail(to, otp) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Music App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Email Verification Code',
    html: `
      <div style="font-family: Arial; max-width: 480px; margin: auto;">
        <h2>Verify Your Email</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Expires in 5 minutes</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

async function sendPasswordResetOTPEmail(to, otp) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Music App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Code',
    html: `
      <div style="font-family: Arial; max-width: 480px; margin: auto;">
        <h2>Reset Your Password</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Expires in 5 minutes. Use this to reset your password.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
