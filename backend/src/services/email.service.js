const nodemailer = require("nodemailer");

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) {
    throw new Error('Missing EMAIL_USER or EMAIL_PASS');
  }

  console.log("🔵 SMTP Gmail ready for:", user);

  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });
}

async function sendOTPEmail(to, otp) {
  console.log("🚀 OTP EMAIL START to:", to);
  
  let transporter;
  try {
    transporter = createTransporter();
    
    const result = await transporter.sendMail({
      from: `"Music App" <${user}>`,
      to,
      subject: "Your OTP Code - Music App",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #495057;">
            ${otp}
          </div>
          <p style="color: #666;">This code expires in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    console.log("✅ OTP EMAIL SENT:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ OTP EMAIL ERROR:", {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode,
      response: error.response
    });
    throw error;
  } finally {
    if (transporter) transporter.close();
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  console.log("🚀 PASSWORD RESET EMAIL START to:", to);
  
  let transporter;
  try {
    transporter = createTransporter();
    
    const result = await transporter.sendMail({
      from: `"Music App" <${user}>`,
      to,
      subject: "Password Reset Code - Music App",
      text: `Your password reset OTP is ${otp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Code</h2>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #495057;">
            ${otp}
          </div>
          <p style="color: #666;">This code expires in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>If you didn't request this, safely ignore this email.</p>
        </div>
      `
    });

    console.log("✅ PASSWORD RESET EMAIL SENT:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ PASSWORD RESET EMAIL ERROR:", {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode
    });
    throw error;
  } finally {
    if (transporter) transporter.close();
  }
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };

