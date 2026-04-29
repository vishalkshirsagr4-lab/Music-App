const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vishalkshirsagr4@gmail.com',
      pass: 'gwmdjwquyesoskhb'
    }
  });
}

async function sendOTPEmail(to, otp) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Music App vishalkshirsagr4@gmail.com" <vishalkshirsagr4@gmail.com>`,
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Music App vishalkshirsagr4@gmail.com" <vishalkshirsagr4@gmail.com>`,
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
