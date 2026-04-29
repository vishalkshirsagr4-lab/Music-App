import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });
  const [form, setForm] = useState({ username: user.username || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("/auth/me");
        const profile = res.data.user;
        setUser(profile);
        setForm({ username: profile.username || "" });
        setAvatarPreview(profile.avatar || null);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch (err) {
        console.error(err);
      }
    };
    loadUser();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : user.avatar || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      return toast.error("Username is required");
    }
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("username", form.username);
      if (avatarFile) {
        fd.append("avatar", avatarFile);
      }

      const res = await API.put("/auth/me", fd);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      setAvatarPreview(updatedUser.avatar || null);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(res.data.message || "Profile updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Update failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black text-white">
        <div className="max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile</h1>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Update your username and profile image.</p>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "User")}&background=1db954&color=fff`}
                  alt={user.username || "User"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1db954]"
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  placeholder="Username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:border-[#1db954] transition text-center">
                    <span>{avatarPreview ? "Change photo" : "Upload photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border border-white/10"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-[#1db954] text-black font-bold hover:bg-[#1ed760] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
