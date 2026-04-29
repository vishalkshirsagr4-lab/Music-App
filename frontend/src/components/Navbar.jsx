import { useState } from "react";
import API from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition text-gray-300"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search Bar */}
            <SearchBar />
          </div>

          {/* Right: Profile */}
          <div className="flex items-center gap-3 ml-4">
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/5"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=1db954&color=fff`}
                  alt={user?.username || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-300 font-medium hidden sm:block">
                  {user?.username}
                </span>
                <svg className="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-xl shadow-2xl border border-white/5 py-1 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      Profile
                    </Link>
                    <Link
                      to={user?.role === "artist" ? "/artist" : "/dashboard"}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

