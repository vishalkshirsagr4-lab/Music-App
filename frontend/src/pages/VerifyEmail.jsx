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
  const [step, setStep] = useState(emailFromUrl ? 2 : 1); // 1 = enter email, 2 = enter OTP
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [attemptsLeft, setAttemptsLeft] = useState(3);
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
      await API.post("/auth/send-otp", { email });
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
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });
      toast.success(res.data.message, {
        style: { background: "#282828", color: "#fff" },
      });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      toast.error(msg, {
        style: { background: "#282828", color: "#fff" },
      });

      // Decrement attempts locally for UX
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

      // Clear inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setAttemptsLeft(3);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 1 ? "Verify Your Email" : "Enter OTP"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? "We'll send a 6-digit code to your inbox"
              : `Code sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
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
                "Send OTP"
              )}
            </button>
          </form>
        ) : (
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
                "Verify Email"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-[#1db954] hover:underline"
              >
                Didn't receive it? Resend OTP
              </button>
            </div>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-gray-500">
          Already verified?{" "}
          <Link to="/" className="text-white font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

