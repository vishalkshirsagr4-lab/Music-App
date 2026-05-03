const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
require('./strategies/google.strategy');
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

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// OAuth routes at root /auth (for callback)
app.use('/auth', authRoutes);

// API routes at /api/*
app.use('/api/music', musicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/test', require('./routes/test.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

module.exports = app;
