const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const sectionRoutes = require('./routes/section.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());
const cors = require("cors");

app.use(cors({
  origin: "https://music-app-chi-opal.vercel.app/",
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sections', sectionRoutes);

module.exports = app;
