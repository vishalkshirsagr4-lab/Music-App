require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');
const seedAdmin = require('./src/utils/seedAdmin');

// Validate env vars
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing env var: ${key}`);
    process.exit(1);
  }
}

console.log('✅ Env vars loaded');

async function startServer() {
  try {
    await connectDB();
    console.log('✅ DB connected');

    await seedAdmin();
    console.log('✅ Seeded admin');

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error('💥 Startup failed:', err);
    process.exit(1);
  }
}

startServer();