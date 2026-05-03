const tls = require('tls');
const { promisify } = require('util');

function createSMTPConnection() {
  const user = 'kshirasagarvishal1@gmail.com';
  const pass = 'puiv qujh mgwn tgbe';

  console.log("🔵 EMAIL_USER:", user);
  console.log("🔵 EMAIL_PASS EXISTS:", !!pass);

  if (!user || !pass) {
    throw new Error("EMAIL env missing in Render");
  }

  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: 'smtp.gmail.com',
      port: 465,
      rejectUnauthorized: false
    }, () => {
      console.log('✅ SMTP TLS Connected');
      resolve(socket);
    });

    socket.on('error', reject);
  });
}

async function sendEmailViaSMTP(to, subject, text) {
  const socket = await createSMTPConnection();
  const readData = promisify(socket.read.bind(socket));
  
  try {
    // Wait for 220 greeting
    let data = await new Promise((resolve, reject) => {
      const onData = (chunk) => {
        socket.removeListener('data', onData);
        resolve(chunk.toString());
      };
      socket.once('data', onData);
      socket.once('error', reject);
    });
    console.log('← 220', data.trim());
    if (!data.includes('220')) throw new Error('No SMTP greeting');

    // EHLO
    socket.write('EHLO music-app\\r\\n');
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
      socket.once('timeout', reject);
      socket.setTimeout(10000);
    });
    console.log('← 250', data.trim());

    // AUTH LOGIN
    socket.write('AUTH LOGIN\\r\\n');
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 334', data.trim());
    if (!data.includes('334')) throw new Error('AUTH failed');

    // Username base64
    const userB64 = Buffer.from(user).toString('base64');
    socket.write(userB64 + '\\r\\n');
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 334', data.trim());

    // Password base64
    const passB64 = Buffer.from(pass).toString('base64');
    socket.write(passB64 + '\\r\\n');
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 235', data.trim());
    if (!data.includes('235')) throw new Error('AUTH LOGIN failed');

    // MAIL FROM
    socket.write(`MAIL FROM:<${user}>\\r\\n`);
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 250', data.trim());

    // RCPT TO
    socket.write(`RCPT TO:<${to}>\\r\\n`);
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 250', data.trim());
    if (!data.includes('250')) throw new Error('RCPT failed');

    // DATA
    socket.write('DATA\\r\\n');
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 354', data.trim());

    // Email content
    const from = encodeURIComponent(user);
    const body = `From: ${user}\\r\\nTo: ${to}\\r\\nSubject: ${subject}\\r\\n\\r\\n${text}`;
    socket.write(body + '\\r\\n.\\r\\n');
    
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 250', data.trim());

    // QUIT
    socket.write('QUIT\\r\\n');
    data = await new Promise((resolve, reject) => {
      socket.once('data', (chunk) => resolve(chunk.toString()));
    });
    console.log('← 221', data.trim());

    console.log("✅ EMAIL SENT SUCCESSFULLY");

    return { success: true };

  } catch (err) {
    console.log("❌ SMTP ERROR:", err.message);
    throw new Error("Email service failed: " + err.message);
  } finally {
    socket.destroy();
  }
}

async function sendOTPEmail(to, otp) {
  console.log("🚀 OTP EMAIL START");
  try {
    const result = await sendEmailViaSMTP(to, "OTP Verification", `Your OTP is ${otp}`);
    console.log("✅ EMAIL SENT");
    return result;
  } catch (err) {
    console.log("❌ EMAIL ERROR DETAILS:");
    console.log("NAME:", err.name || 'SMTP');
    console.log("MESSAGE:", err.message);
    console.log("CODE:", err.code || 'SMTP');
    throw err;
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  console.log("🚀 PASSWORD RESET EMAIL START");
  try {
    const result = await sendEmailViaSMTP(
      to, 
      "Password Reset OTP", 
      `Your password reset OTP is ${otp}. It expires in 5 minutes.`
    );
    console.log("✅ PASSWORD RESET EMAIL SENT");
    return result;
  } catch (err) {
    console.log("❌ PASSWORD RESET EMAIL ERROR:", err.message);
    throw new Error("Password reset email service failed");
  }
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };

