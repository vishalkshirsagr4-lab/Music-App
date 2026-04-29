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
  const [otpSent, setOtpSent] = useState(emailFromUrl ? true : false);

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
      setOtpSent(true);
      setOtp(["", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
      console.error("Send OTP fail:", err.response?.data || err);
    }
    setLoading(false);
  };

  // VERIFY OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter full OTP");

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp: code });
      toast.success(res.data.message);
      setOtpSent(false);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setAttemptsLeft((prev) => Math.max(prev - 1, 0));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  // RESEND
  const handleResendOTP = async () => {
    if (!email) return toast.error("Enter email");
    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email });
      toast.success("OTP resent!");
      setCountdown(300);
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    }
    setLoading(false);
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6">
      <div className="bg-[#121212] w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? "Verify Email" : "Enter OTP"}
          </h2>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
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
          <div className="space-y-4">
            {/* OTP Sent Banner */}
            {otpSent && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-3 rounded-xl text-sm text-center">
                ✅ OTP sent to <strong>{email}</strong> 
                <br className="sm:hidden" />
                <span className="block sm:inline text-xs">(check spam too)</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP}>
              <div className="flex gap-2 justify-center flex-wrap sm:flex-nowrap">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    className="w-14 h-14 flex-1 min-w-[50px] sm:min-w-[56px] text-2xl font-bold text-center bg-white/10 border-2 border-white/20 rounded-xl focus:border-[#1db954] focus:outline-none transition disabled:opacity-50 sm:flex-none"
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
                className="w-full text-[#1db954] hover:text-[#1ed760] disabled:opacity-50 text-sm py-2 transition"
              >
                {countdown > 0 ? `Resend in ${formatTime(countdown)}` : "Resend OTP"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm">
          <Link to="/" className="text-gray-400 hover:text-white transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

