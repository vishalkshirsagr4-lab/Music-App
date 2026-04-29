const nodemailer = require("nodemailer");

function createTransporter() {
  console.log("🔵 Creating transporter...");

  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "vishalkshirsagr4@gmail.com",
      pass: process.env.EMAIL_PASS || "gwmdjwquyesoskhb",
    },
  });
}

async function sendOTPEmail(to, otp) {
  console.log("🚀 sendOTPEmail called");
  console.log("📩 Sending to:", to);
  console.log("🔢 OTP:", otp);

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Music App" <${process.env.EMAIL_USER || "vishalkshirsagr4@gmail.com"}>`,
      to,
      subject: "Your Email Verification Code",
      html: `
        <div style="font-family: Arial; max-width: 480px; margin: auto;">
          <h2>Verify Your Email</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>Expires in 5 minutes</p>
        </div>
      `,
    };

    console.log("📤 Sending email...");

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("📨 Message ID:", info.messageId);

    return info;
  } catch (err) {
    console.log("❌ EMAIL FAILED");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Full Error:", err);

    throw err;
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  console.log("🔁 Password reset OTP triggered");

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Music App" <${process.env.EMAIL_USER || "vishalkshirsagr4@gmail.com"}>`,
      to,
      subject: "Password Reset Code",
      html: `
        <div style="font-family: Arial; max-width: 480px; margin: auto;">
          <h2>Reset Your Password</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>Expires in 5 minutes</p>
        </div>
      `,
    };

    console.log("📤 Sending reset email...");

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ RESET EMAIL SENT");
    console.log("📨 Message ID:", info.messageId);

    return info;
  } catch (err) {
    console.log("❌ RESET EMAIL FAILED");
    console.error(err);
    throw err;
  }
}

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
};