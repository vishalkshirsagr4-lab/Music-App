import { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(emailFromUrl ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [otpSent, setOtpSent] = useState(false); // New state for sent banner

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

  // SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Enter email");

    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email });

      toast.success("OTP sent!");
      setStep(2);
      setCountdown(300);
      setAttemptsLeft(3);
      setOtp(["", "", "", "", "", ""]);
      setOtpSent(true); // Show banner

      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      toast.error(msg);
      console.error("Send OTP fail:", err.response?.data || err);
    }
    setLoading(false);
  };

  // OTP input
  const handleOtpChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[i] = value.slice(-1);
    setOtp(newOtp);

    if (value && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  // VERIFY OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter full 6-digit OTP");

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      toast.success(res.data.message);
      setOtpSent(false);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      toast.error(msg);
      setAttemptsLeft((prev) => Math.max(prev - 1, 0));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  // RESEND OTP
  const handleResendOTP = async () => {
    if (!email) return toast.error("Enter email");

    setLoading(true);

    try {
      await API.post("/auth/send-otp", { email });

      toast.success("OTP resent!");
      setCountdown(300);
      setAttemptsLeft(3);
      setOtp(["", "", "", "", "", ""]);
      setOtpSent(true); // Update banner
    } catch (err) {
      const msg = err.response?.data?.message || "Resend failed";
      toast.error(msg);
      console.error("Resend fail:", err.response?.data || err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5">
        <h2 className="text-white text-xl font-bold text-center mb-6">
          {step === 1 ? "Verify Email" : "Enter OTP"}
        </h2>

        {step === 1 ? (
          // Email step
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                disabled={loading}
              />
            </div>
            <button
              className="w-full bg-[#1db954] text-black py-3 rounded-xl font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          // OTP step
          <div>
            {/* ✅ OTP Sent Banner */}
            {otpSent && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-xl mb-6 text-sm">
                ✅ OTP sent to <strong>{email}</strong>. Check your inbox (or spam folder)!
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    className="w-14 h-14 text-2xl font-bold text-center bg-white/10 border-2 border-white/20 rounded-xl focus:border-[#1db954] focus:outline-none transition disabled:opacity-50"
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="text-center text-xs text-gray-400 space-y-1">
                <div>Expires in {formatTime(countdown)}</div>
                <div>Attempts left: {attemptsLeft}</div>
              </div>

              <button
                className="w-full bg-[#1db954] text-black py-3 rounded-xl font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || countdown > 0}
                className="w-full text-[#1db954] hover:text-[#1ed760] disabled:opacity-50 disabled:cursor-not-disabled text-sm py-2 transition"
              >
                {countdown > 0 ? `Resend (${formatTime(countdown)})` : "Resend OTP"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm">
          <Link to="/" className="text-gray-400 hover:text-white transition">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

