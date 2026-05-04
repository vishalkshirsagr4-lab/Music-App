const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Alias for any authenticated user
const authAny = authMiddleware;

// Artist only (after auth)
const authArtist = async (req, res, next) => {
  if (req.user.role !== 'artist') {
    return res.status(403).json({ message: 'Artist access required' });
  }
  next();
};

// Artist or Admin
const authArtistOrAdmin = async (req, res, next) => {
  if (!['artist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Artist or admin access required' });
  }
  next();
};

// Alias for admin
const authAdmin = isAdmin;

console.log('✅ Auth middleware loaded:', {
  authMiddleware: typeof authMiddleware === 'function',
  authAny: typeof authAny === 'function',
  authArtist: typeof authArtist === 'function',
  authArtistOrAdmin: typeof authArtistOrAdmin === 'function',
  authAdmin: typeof authAdmin === 'function',
  isAdmin: typeof isAdmin === 'function'
});

module.exports = { 
  authMiddleware, 
  isAdmin,
  authAny,
  authArtist,
  authArtistOrAdmin,
  authAdmin 
};


