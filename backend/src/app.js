const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const sectionRoutes = require('./routes/section.routes');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());
const cors = require("cors");

const allowedOrigins = (process.env.CLIENT_URL || "https://music-app-chi-opal.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/test', require('./routes/test.routes'));

// Serve frontend build (Vite)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React Router routes - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

module.exports = app;
