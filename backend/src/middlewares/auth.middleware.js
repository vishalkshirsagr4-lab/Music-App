const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

// Decode token from cookie or Authorization header
function decodeToken(req) {
  let token = req.cookies?.token;

  if (!token && req.headers?.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }

  if (!token) return { error: "Unauthorized", status: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { decoded };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}

// Verify user exists in DB and attach fresh role
async function verifyUser(req, res) {
  const { decoded, error, status } = decodeToken(req);
  if (error) return { error, status };

  const user = await userModel.findById(decoded.id).select("-password");
  if (!user) return { error: "User not found", status: 401 };

  return { user };
}

// ONLY ARTIST
async function authArtist(req, res, next) {
  const { user, error, status } = await verifyUser(req, res);
  if (error) return res.status(status).json({ message: error });

  if (user.role !== "artist") {
    return res.status(403).json({ message: "Artist access only" });
  }

  req.user = { id: user._id, role: user.role };
  next();
}

// ONLY USER
async function authUser(req, res, next) {
  const { user, error, status } = await verifyUser(req, res);
  if (error) return res.status(status).json({ message: error });

  if (user.role !== "user") {
    return res.status(403).json({ message: "User access only" });
  }

  req.user = { id: user._id, role: user.role };
  next();
}

// ONLY ADMIN
async function authAdmin(req, res, next) {
  const { user, error, status } = await verifyUser(req, res);
  if (error) return res.status(status).json({ message: error });

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  req.user = { id: user._id, role: user.role };
  next();
}

// ARTIST OR ADMIN
async function authArtistOrAdmin(req, res, next) {
  const { user, error, status } = await verifyUser(req, res);
  if (error) return res.status(status).json({ message: error });

  if (user.role !== "artist" && user.role !== "admin") {
    return res.status(403).json({ message: "Artist or Admin access only" });
  }

  req.user = { id: user._id, role: user.role };
  next();
}

// BOTH USER + ARTIST + ADMIN
async function authAny(req, res, next) {
  const { user, error, status } = await verifyUser(req, res);
  if (error) return res.status(status).json({ message: error });

  if (!["user", "artist", "admin"].includes(user.role)) {
    return res.status(403).json({ message: "Invalid role" });
  }

  req.user = { id: user._id, role: user.role };
  next();
}

module.exports = {
  authArtist,
  authUser,
  authAdmin,
  authArtistOrAdmin,
  authAny,
};
