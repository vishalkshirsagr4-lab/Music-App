require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const seedAdmin = require('./src/utils/seedAdmin');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function startServer() {
  try {
    await connectDB();
    await seedAdmin();

    app.listen(process.env.PORT || 3000, () => {
      console.log('Server is running on port ' + (process.env.PORT || 3000));
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();
