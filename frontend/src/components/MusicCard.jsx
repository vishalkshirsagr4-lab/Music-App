import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isLiked, toggleLike } from "../utils/likes";
import toast from "react-hot-toast";

export default function MusicCard({ music }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(() => isLiked(music._id));

  const handleLike = (e) => {
    e.stopPropagation();
    const nowLiked = toggleLike(music._id);
    setLiked(nowLiked);
    toast(nowLiked ? "Added to Liked Songs" : "Removed from Liked Songs", {
      icon: nowLiked ? "❤️" : "💔",
      style: { background: "#282828", color: "#fff" },
    });
  };

  return (
    <div
      onClick={() => navigate(`/player/${music._id}`)}
      className="group relative cursor-pointer bg-[#181818] rounded-2xl overflow-hidden hover:bg-[#282828] transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden">
        <img
          src={music.image || "https://via.placeholder.com/300?text=Music"}
          alt={music.title}
          className="w-full aspect-square object-cover group-hover:scale-105 transition duration-500"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />

        {/* LIKE BUTTON */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            liked
              ? "bg-white/20 text-red-500"
              : "bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-white/20"
          }`}
        >
          <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* PLAY BUTTON (hover effect) */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition">
            <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* TEXT */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-1">
          {music.title}
        </h3>
        <p className="text-sm text-gray-400 truncate">
          {music.artist?.username || "Unknown"}
        </p>
      </div>
    </div>
  );
}

