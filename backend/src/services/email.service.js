const tls = require('tls');

const user = 'kshirasagarvishal1@gmail.com';
const pass = 'puiv qujh mgwn tgbe';

console.log("🔵 EMAIL_USER:", user);
console.log("🔵 EMAIL_PASS EXISTS:", !!pass);

if (!user || !pass) {
  throw new Error("EMAIL env missing in Render");
}

async function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let data = '';
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP timeout'));
    }, 10000);

    const onData = (chunk) => {
      data += chunk.toString();
      if (data.includes('\\n') && data.match(/^[245][0-9]{2}/)) {
        clearTimeout(timeout);
        socket.removeListener('data', onData);
        resolve(data);
      }
    };

    socket.on('data', onData);
    socket.once('error', reject);
  });
}

async function sendSMTP(to, subject, body) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      socketType: 'smtp',
      host: 'smtp.gmail.com',
      port: 465,
      rejectUnauthorized: false
    }, async () => {
      try {
        // Read greeting
        let response = await readResponse(socket);
        console.log('SMTP 220:', response.trim());

        // EHLO
        socket.write('EHLO musicapp\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP EHLO:', response.trim());

        // AUTH LOGIN
        socket.write('AUTH LOGIN\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP AUTH:', response.trim());

        // User b64
        const userB64 = Buffer.from(user).toString('base64');
        socket.write(userB64 + '\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP USER:', response.trim());

        // Pass b64
        const passB64 = Buffer.from(pass).toString('base64');
        socket.write(passB64 + '\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP 235 Auth OK:', response.trim());

        // MAIL FROM
        socket.write(`MAIL FROM:<${user}>\\r\\n`);
        response = await readResponse(socket);
        console.log('SMTP MAIL FROM:', response.trim());

        // RCPT TO
        socket.write(`RCPT TO:<${to}>\\r\\n`);
        response = await readResponse(socket);
        console.log('SMTP RCPT:', response.trim());

        // DATA
        socket.write('DATA\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP DATA:', response.trim());

        // Message
        const headers = `From: ${user}\\r\\nTo: ${to}\\r\\nSubject: ${subject}\\r\\nContent-Type: text/plain; charset=utf-8\\r\\n\\r\\n`;
        socket.write(headers + body + '\\r\\n.\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP Queued:', response.trim());

        // QUIT
        socket.write('QUIT\\r\\n');
        response = await readResponse(socket);
        console.log('SMTP QUIT:', response.trim());

        socket.end();
        resolve({ success: true, messageId: 'native-smtp-' + Date.now() });

      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });

    socket.on('error', reject);
    socket.setTimeout(30000);
  });
}

async function sendOTPEmail(to, otp) {
  console.log("🚀 OTP EMAIL START");
  try {
    const result = await sendSMTP(to, "OTP Verification", `Your OTP is ${otp}`);
    console.log("✅ EMAIL SENT:", result.messageId);
    return result;
  } catch (err) {
    console.log("❌ EMAIL ERROR:", err.message);
    console.log("NAME:", err.name);
    console.log("CODE:", err.code);
    throw new Error("Email service failed");
  }
}

async function sendPasswordResetOTPEmail(to, otp) {
  console.log("🚀 PASSWORD RESET EMAIL START");
  try {
    const result = await sendSMTP(to, "Password Reset OTP", `Your password reset OTP is ${otp}. Expires in 5 minutes.`);
    console.log("✅ PASSWORD RESET EMAIL SENT:", result.messageId);
    return result;
  } catch (err) {
    console.log("❌ PASSWORD RESET ERROR:", err.message);
    throw new Error("Password reset email service failed");
  }
}

module.exports = { sendOTPEmail, sendPasswordResetOTPEmail };

