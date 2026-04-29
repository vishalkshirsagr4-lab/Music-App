const nodemailer = require("nodemailer");

function createTransporter() {
  const user = 'kshirasagarvishal1@gmail.com';
  const pass = 'puivqujhmgwntgbe';

  console.log("🔵 EMAIL_USER:", user);
  console.log("🔵 EMAIL_PASS EXISTS:", !!pass);

  if (!user || !pass) {
    throw new Error("EMAIL env missing in Render");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    pool: true,
    maxConnections: 1,
    maxMessages: 5,
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });
}

async function sendOTPEmail(to, otp) {
  console.log("🚀 OTP EMAIL START");

  try {
    const transporter = createTransporter();

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    console.log("✅ EMAIL SENT:", result.messageId);
    return result;

  } catch (err) {
    console.log("❌ EMAIL ERROR DETAILS:");
    console.log("NAME:", err.name);
    console.log("MESSAGE:", err.message);
    console.log("CODE:", err.code);

    throw new Error("Email service failed");
  }
}

module.exports = { sendOTPEmail };