import { useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await API.post("/auth/register", formData);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      toast.success(`${res.data.message}. Check your email for verification code!`, {
        style: { background: "#282828", color: "#fff" },
      });
      navigate("/verify-email?email=" + encodeURIComponent(form.email));
    } catch (err) {
      toast.error(err.response?.data?.message || "Register failed", {
        style: { background: "#282828", color: "#fff" },
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Start your music journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Your username"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
            />
          </div>

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
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Profile photo <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <label className="group relative flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white cursor-pointer hover:border-[#1db954] transition">
              <span>{avatarPreview ? "Change photo" : "Upload photo"}</span>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1db954] text-black py-3 rounded-full font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-white font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
