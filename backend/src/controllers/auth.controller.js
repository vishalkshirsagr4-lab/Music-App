const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const { sendOTPEmail, sendPasswordResetOTPEmail } = require("../services/email.service");
const { uploadFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;
        const avatarFile = req.file;
        let avatarUrl;

        if (avatarFile) {
            const imageResult = await uploadFile(avatarFile, "avatar", avatarFile.mimetype);
            avatarUrl = imageResult.url;
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (isUserAlreadyExists) {
            return res.status(409).json({ message: "User already exists" })
        }

        const hash = await bcrypt.hash(password, 10)

        const userData = {
            username,
            email,
            password: hash,
            role: "user",
            artistRequestStatus: "none",
            isEmailVerified: false,
        };

        if (avatarUrl) {
            userData.avatar = avatarUrl;
        }

        const user = await userModel.create(userData)

        const token = jwt.sign({
            id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET)

        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie("token", token, cookieOptions)

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                artistRequestStatus: user.artistRequestStatus,
                avatar: user.avatar,
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" })
    }
}


async function loginUser(req, res) {
    try {

        const { username, email, password } = req.body;


        const user = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }


        const isPasswordValid = await bcrypt.compare(password, user.password)


        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Email not verified",
                email: user.email,
                needsVerification: true,
            })
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET)

        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie("token", token, cookieOptions)


        res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                artistRequestStatus: user.artistRequestStatus,
                avatar: user.avatar,
            }
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" })
    }




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

async function sendOTP(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete any existing email verification OTP for this email
        await otpModel.deleteMany({ email, type: 'email_verification' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save OTP with 5-minute expiry
        await otpModel.create({
            email,
            hashedOTP,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0,
            type: 'email_verification',
        });

        // Store OTP first (always available for verify)
        // Send OTP via email (non-blocking)
        sendOTPEmail(email, otp).then(() => {
          console.log('✅ Email sent successfully');
        }).catch((emailErr) => {
          console.error('⚠️ Email failed but OTP stored:', emailErr.message);
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).json({ message: err.message || "Failed to send OTP" });
    }
}


async function verifyOTP(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const otpRecord = await otpModel.findOne({ email, type: 'email_verification' });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check max attempts
        if (otpRecord.attempts >= 3) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Compare OTP
        const isValid = await bcrypt.compare(otp, otpRecord.hashedOTP);

        if (!isValid) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
                await otpModel.deleteOne({ _id: otpRecord._id });
            }

            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is valid — mark email as verified
        await userModel.updateOne({ email }, { isEmailVerified: true });

        // Clean up OTP record
        await otpModel.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ message: "Server error" });
    }
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
                username: user.username,
                email: user.email,
                role: user.role,
                artistRequestStatus: user.artistRequestStatus,
                avatar: user.avatar,
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
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
                    username: user.username,
                    email: user.email,
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
                username: updatedUser.username,
                email: updatedUser.email,
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

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete any existing password reset OTP for this email
        await otpModel.deleteMany({ email, type: 'password_reset' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Save OTP with 5-minute expiry
        await otpModel.create({
            email,
            hashedOTP,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0,
            type: 'password_reset',
        });

        // Send OTP via email (non-blocking)
        sendPasswordResetOTPEmail(email, otp).then(() => {
          console.log('✅ Password reset email sent');
        }).catch((emailErr) => {
          console.error('⚠️ Password reset email failed but OTP stored:', emailErr.message);
        });

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

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check max attempts
        if (otpRecord.attempts >= 3) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Compare OTP
        const isValid = await bcrypt.compare(otp, otpRecord.hashedOTP);

        if (!isValid) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
                await otpModel.deleteOne({ _id: otpRecord._id });
            }

            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is valid — generate a short-lived reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Clean up OTP record
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

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password and update
        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { registerUser, loginUser, logoutUser, sendOTP, verifyOTP, getMe, updateMe, requestArtist, sendForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword }

