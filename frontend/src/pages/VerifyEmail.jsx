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

  // ✅ SEND OTP (FIXED)
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Enter email");

    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email });

      toast.success("OTP sent to email");

      setStep(2);
      setCountdown(300);
      setAttemptsLeft(3);
      setOtp(["", "", "", "", "", ""]);

      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP send failed");
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
    if (code.length !== 6) return toast.error("Enter full OTP");

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      toast.success(res.data.message);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");

      setAttemptsLeft((prev) => Math.max(prev - 1, 0));

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }

    setLoading(false);
  };

  // 🔥 FIXED RESEND (ONLY RESEND OTP)
  const handleResendOTP = async () => {
    if (!email) return toast.error("Enter email");

    setLoading(true);

    try {
      await API.post("/auth/send-otp", { email });

      toast.success("OTP resent");

      setCountdown(300);
      setAttemptsLeft(3);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-sm p-6 rounded-2xl">

        <h2 className="text-white text-xl font-bold text-center mb-4">
          {step === 1 ? "Verify Email" : "Enter OTP"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded bg-white/10 text-white"
            />

            <button
              className="w-full mt-3 bg-green-500 py-2 rounded"
              disabled={loading}
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="flex gap-2 justify-center">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 text-center bg-white/10 text-white"
                />
              ))}
            </div>

            <p className="text-gray-400 text-sm mt-2 text-center">
              Expires in {formatTime(countdown)} | Attempts {attemptsLeft}
            </p>

            <button
              className="w-full mt-3 bg-green-500 py-2 rounded"
              disabled={loading}
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm text-green-400 mt-3 w-full"
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="text-gray-500 text-sm mt-4 text-center">
          <Link to="/">Back to login</Link>
        </p>
      </div>
    </div>
  );
}