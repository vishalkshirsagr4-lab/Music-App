import { useNavigate } from "react-router-dom";
import { getRecentlyPlayed } from "../utils/recentlyPlayed";
import { useState } from "react";

export default function RecentlyPlayed() {
  const navigate = useNavigate();
  const [recent] = useState(() => getRecentlyPlayed());

  if (recent.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Recently Played</h2>
        <button
          onClick={() => navigate("/recent")}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          See all →
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {recent.map((music) => (
          <div
            key={music._id}
            onClick={() => navigate(`/player/${music._id}`)}
            className="group flex-shrink-0 w-36 sm:w-44 cursor-pointer snap-start"
          >
            <div className="relative rounded-2xl overflow-hidden mb-3 bg-[#181818]">
              <img
                src={music.image || "https://via.placeholder.com/300?text=Music"}
                alt={music.title}
                className="w-full aspect-square object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">
                <div className="w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white truncate">{music.title}</h3>
            <p className="text-xs text-gray-500 truncate">
              {music.artist?.username || "Unknown"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

