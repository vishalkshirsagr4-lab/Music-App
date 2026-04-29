import { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset password
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [otpSent, setOtpSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const inputRefs = useRef([]);

  // countdown
  useEffect(() => {
    if (step !== 2) return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Step 1: Send reset OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Enter email");

    setLoading(true);
    try {
      await API.post("/auth/forgot-password/send-otp", { email });
      toast.success("Reset code sent!");
      setStep(2);
      setCountdown(300);
      setOtpSent(true);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || "Send failed");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter full OTP");

    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password/verify-otp", {
        email,
        otp: code,
      });
      setResetToken(res.data.resetToken);
      setStep(3);
      setOtpSent(false);
      toast.success("OTP verified!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setAttemptsLeft((prev) => Math.max(prev - 1, 0));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be 6+ chars");

    setLoading(true);
    try {
      await API.post("/auth/forgot-password/reset", {
        resetToken,
        newPassword,
      });
      toast.success("Password reset success! Login with new password.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
    setLoading(false);
  };

  // OTP handlers
  const handleOtpChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value.slice(-1);
    setOtp(newOtp);
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await API.post("/auth/forgot-password/send-otp", { email });
      toast.success("OTP resent!");
      setCountdown(300);
      setAttemptsLeft(3);
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 1 ? "Forgot Password?" : step === 2 ? "Reset Code" : "New Password"}
          </h2>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {otpSent && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-3 rounded-xl text-sm text-center">
                ✅ Reset code sent to <strong>{email}</strong>
              </div>
            )}

            <form onSubmit={handleVerifyOTP}>
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    className="w-14 h-14 text-2xl font-bold text-center bg-white/10 border-2 border-white/20 rounded-xl focus:border-yellow-500 focus:outline-none transition"
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="text-center text-xs text-gray-400 space-y-1">
                <div>Expires in {formatTime(countdown)}</div>
                <div>Attempts: {attemptsLeft}</div>
              </div>

              <button
                className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || countdown > 0}
                className="w-full text-yellow-400 hover:text-yellow-300 disabled:opacity-50 text-sm py-2 transition"
              >
                {countdown > 0 ? `Resend (${formatTime(countdown)})` : "Resend Code"}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (6+ chars)"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                minLength={6}
              />
            </div>
            <button
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50"
              disabled={loading || newPassword.length < 6}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm space-y-1">
          <Link to="/" className="text-gray-400 hover:text-white block transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

