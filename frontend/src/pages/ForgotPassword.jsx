import { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resetToken, setResetToken] = useState("");
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (step !== 2) return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email", {
        style: { background: "#282828", color: "#fff" },
      });
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/forgot-password/send-otp", { email });
      toast.success("OTP sent to your email", {
        style: { background: "#282828", color: "#fff" },
      });
      setStep(2);
      setCountdown(300);
      setAttemptsLeft(3);
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP", {
        style: { background: "#282828", color: "#fff" },
      });
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits", {
        style: { background: "#282828", color: "#fff" },
      });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password/verify-otp", {
        email,
        otp: otpString,
      });
      toast.success(res.data.message, {
        style: { background: "#282828", color: "#fff" },
      });
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
        setStep(3);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      toast.error(msg, {
        style: { background: "#282828", color: "#fff" },
      });

      setAttemptsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          toast.error("Maximum attempts reached. Please request a new OTP.", {
            style: { background: "#282828", color: "#fff" },
          });
          setStep(1);
        }
        return next;
      });

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields", {
        style: { background: "#282828", color: "#fff" },
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        style: { background: "#282828", color: "#fff" },
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters", {
        style: { background: "#282828", color: "#fff" },
      });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password/reset", {
        resetToken,
        newPassword,
      });
      toast.success(res.data.message, {
        style: { background: "#282828", color: "#fff" },
      });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password", {
        style: { background: "#282828", color: "#fff" },
      });
    }
    setLoading(false);
  };

  const handleResend = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setAttemptsLeft(3);
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Forgot Password";
      case 2:
        return "Verify OTP";
      case 3:
        return "Reset Password";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return "Enter your email to receive a reset code";
      case 2:
        return `Code sent to ${email}`;
      case 3:
        return "Enter your new password";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-4">
            {step === 1 && (
              <svg
                className="w-7 h-7 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 65C7.58172 65 4 68.5817 4 73C4 77.4183 7.58172 81 12 81C16.4183 81 20 77.4183 20 73C20 68.5817 16.4183 65 12 65ZM12 4C15.3137 4 18 6.68629 18 10V16H22V34H2V16H6V10C6 6.68629 8.68629 4 12 4ZM12 8C10.8954 8 10 8.89543 10 10V16H14V10C14 8.89543 13.1046 8 12 8Z"/>
              </svg>
            )}
            {step === 2 && (
              <svg
                className="w-7 h-7 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            )}
            {step === 3 && (
              <svg
                className="w-7 h-7 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">{getStepTitle()}</h2>
          <p className="text-sm text-gray-500 mt-1">{getStepSubtitle()}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1db954] text-black py-3 rounded-full font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                />
              ))}
            </div>

            <div className="flex justify-between text-sm text-gray-400 px-1">
              <span>Attempts left: {attemptsLeft}/3</span>
              <span
                className={countdown <= 30 ? "text-red-400" : "text-gray-400"}
              >
                Expires in {formatTime(countdown)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || countdown <= 0}
              className="w-full bg-[#1db954] text-black py-3 rounded-full font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-[#1db954] hover:underline"
              >
                Didn&apos;t receive it? Resend
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1db954] text-black py-3 rounded-full font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-gray-500">
          Remember your password?{" "}
          <Link to="/" className="text-white font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
