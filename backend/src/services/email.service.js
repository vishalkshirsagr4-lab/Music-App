const tls = require('tls');
const { promisify } = require('util');

<<<<<<< HEAD
function createSMTPConnection() {
=======
function createTransporter() {
>>>>>>> a713bd5 (fixed)
  const user = 'kshirasagarvishal1@gmail.com';
  const pass = 'puiv qujh mgwn tgbe';

  console.log("🔵 EMAIL_USER:", user);
  console.log("🔵 EMAIL_PASS EXISTS:", !!pass);

  if (!user || !pass) {
    throw new Error("EMAIL env missing in Render");
  }

<<<<<<< HEAD
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
=======
  return nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: { 
      user, 
      pass 
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 5,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    logger: true,
    debug: true
>>>>>>> a713bd5 (fixed)
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
<<<<<<< HEAD
    const result = await sendEmailViaSMTP(to, "OTP Verification", `Your OTP is ${otp}`);
    console.log("✅ EMAIL SENT");
=======
    const transporter = createTransporter();

    const result = await transporter.sendMail({
      from: '"Music App" <kshirasagarvishal1@gmail.com>',
      to,
      subject: "OTP Verification - Music App",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<h2>Your OTP is <strong>${otp}</strong></h2><p>It expires in 5 minutes.</p>`
    });

    console.log("✅ EMAIL SENT:", result.messageId);
>>>>>>> a713bd5 (fixed)
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
<<<<<<< HEAD
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
=======

  try {
    const transporter = createTransporter();

    const result = await transporter.sendMail({
      from: '"Music App" <kshirasagarvishal1@gmail.com>',
      to,
      subject: "Password Reset OTP - Music App",
      text: `Your password reset OTP is ${otp}. It expires in 5 minutes.`,
      html: `<h2>Password Reset OTP: <strong>${otp}</strong></h2><p>Expires in 5 minutes. If you did not request this, ignore.</p>`
    });

    console.log("✅ PASSWORD RESET EMAIL SENT:", result.messageId);
    return result;

  } catch (err) {
    console.log("❌ PASSWORD RESET EMAIL ERROR DETAILS:");
    console.log("NAME:", err.name);
    console.log("MESSAGE:", err.message);
    console.log("CODE:", err.code);

>>>>>>> a713bd5 (fixed)
    throw new Error("Password reset email service failed");
  }
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };
<<<<<<< HEAD

=======
>>>>>>> a713bd5 (fixed)
