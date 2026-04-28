import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isArtist = user.role === "artist";
  const isAdmin = user.role === "admin";
  const isUser = user.role === "user";
  const [requesting, setRequesting] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: "/dashboard", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/recent", label: "Recent", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  if (isArtist) {
    navItems.push(
      { to: "/artist", label: "Artist Dashboard", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" },
      { to: "/upload", label: "Upload", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
      { to: "/albums", label: "Albums", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }
    );
  }

  if (isAdmin) {
    navItems.push(
      { to: "/admin", label: "Admin Dashboard", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" }
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full bg-[#121212] border-r border-white/5 z-50 flex flex-col transition-transform duration-300 w-64 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center justify-between px-6 py-5">
          <Link to={isArtist ? "/artist" : "/dashboard"} className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MusicApp</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => window.innerWidth < 768 && onClose()} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${isActive(item.to) ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=1db954&color=fff`} alt={user?.username || "User"} className="w-9 h-9 rounded-full object-cover border border-white/10" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          {isUser && user.artistRequestStatus === "none" && (
            <button
              onClick={async () => {
                setRequesting(true);
                try {
                  const res = await API.post("/auth/request-artist");
                  toast.success(res.data.message, { style: { background: "#282828", color: "#fff" } });
                  const updatedUser = { ...user, artistRequestStatus: "pending" };
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  window.location.reload();
                } catch (err) {
                  toast.error(err.response?.data?.message || "Request failed", { style: { background: "#282828", color: "#fff" } });
                }
                setRequesting(false);
              }}
              disabled={requesting}
              className="w-full mt-2 px-4 py-2 bg-[#1db954]/10 text-[#1db954] text-sm font-medium rounded-xl hover:bg-[#1db954]/20 transition disabled:opacity-50"
            >
              {requesting ? "Requesting..." : "Apply to be Artist"}
            </button>
          )}
          {isUser && user.artistRequestStatus === "pending" && (
            <div className="mt-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 text-sm font-medium rounded-xl text-center">
              Artist Request Pending
            </div>
          )}
          {isUser && user.artistRequestStatus === "rejected" && (
            <div className="mt-2 px-4 py-2 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl text-center">
              Artist Request Rejected
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
