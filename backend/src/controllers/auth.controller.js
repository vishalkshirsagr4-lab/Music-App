const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const { sendPasswordResetOTPEmail } = require("../services/email.service");
const { uploadFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function generateToken(user) {
  const token = jwt.sign({
    id: user._id,
    role: user.role,
  }, process.env.JWT_SECRET);

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return { token, cookieOptions };
}

async function googleCallback(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  const { token, cookieOptions } = generateToken(user);

  res.cookie("token", token, cookieOptions);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
}

async function logoutUser(req, res) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "User logged out successfully" });
}

async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username || user.name,
        email: user.email,
        name: user.name,
        role: user.role,
        artistRequestStatus: user.artistRequestStatus,
        avatar: user.avatar,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Alias for /user/profile
async function userProfile(req, res) {
  await getMe(req, res);
}

// Admin dashboard
async function adminDashboard(req, res) {
  res.json({ 
    message: 'Admin dashboard',
    user: req.user,
    role: req.user.role 
  });
}

async function updateMe(req, res) {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    const avatarFile = req.file;
    const updates = {};

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const exists = await userModel.findOne({ username });
      if (exists) {
        return res.status(409).json({ message: "Username already taken" });
      }
      updates.username = username;
    }

    if (avatarFile) {
      const imageResult = await uploadFile(avatarFile, "avatar", avatarFile.mimetype);
      updates.avatar = imageResult.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({
        message: "No changes made",
        user: {
          id: user._id,
          username: user.username || user.name,
          email: user.email,
          name: user.name,
          role: user.role,
          artistRequestStatus: user.artistRequestStatus,
          avatar: user.avatar,
        }
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username || updatedUser.name,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        artistRequestStatus: updatedUser.artistRequestStatus,
        avatar: updatedUser.avatar,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function requestArtist(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "artist") {
      return res.status(400).json({ message: "You are already an artist" });
    }
    if (user.artistRequestStatus === "pending") {
      return res.status(400).json({ message: "Artist request already pending" });
    }
    user.artistRequestStatus = "pending";
    await user.save();
    res.status(200).json({ message: "Artist request submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function sendForgotPasswordOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ 
      email, 
      password: { $exists: true, $ne: null } // Only password users can reset
    });
    if (!user) {
      return res.status(404).json({ message: "User not found or Google account" });
    }

    await otpModel.deleteMany({ email, type: 'password_reset' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await otpModel.create({
      email,
      hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      type: 'password_reset',
    });

    sendPasswordResetOTPEmail(email, otp).catch(err => console.error('Email failed:', err));

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send forgot password OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

async function verifyForgotPasswordOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await otpModel.findOne({ email, type: 'password_reset' });

    if (!otpRecord || new Date() > otpRecord.expiresAt || otpRecord.attempts >= 3) {
      await otpModel.deleteOne({ _id: otpRecord?._id });
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.hashedOTP);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });

    await otpModel.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully", resetToken });
  } catch (err) {
    console.error("Verify forgot password OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await userModel.findOne({ 
      email: decoded.email,
      password: { $exists: true, $ne: null }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found or Google account" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

module.exports = { 
  googleCallback, 
  logoutUser, 
  getMe, 
  userProfile,
  adminDashboard,
  updateMe, 
  requestArtist, 
  sendForgotPasswordOTP, 
  verifyForgotPasswordOTP, 
  resetPassword 
};
