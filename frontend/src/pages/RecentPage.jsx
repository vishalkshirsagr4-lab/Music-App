import { useNavigate } from "react-router-dom";
import { getRecentlyPlayed, clearRecentlyPlayed, formatTimeAgo } from "../utils/recentlyPlayed";
import { useState } from "react";
import Layout from "../components/Layout";

export default function RecentPage() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState(() => getRecentlyPlayed());

  const handleClear = () => {
    clearRecentlyPlayed();
    setRecent([]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black">
        <div className="max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Recently Played</h1>
              <p className="text-gray-400 mt-1">Your listening history</p>
            </div>
            {recent.length > 0 && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="bg-[#181818] p-12 rounded-2xl text-center">
              <div className="text-5xl mb-4">🎧</div>
              <p className="text-lg text-gray-400">No recently played tracks</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 px-6 py-2.5 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition"
              >
                Discover Music
              </button>
            </div>
          ) : (
            <div className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">#</th>
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium hidden sm:table-cell">Artist</th>
                      <th className="px-6 py-4 font-medium text-right">Played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((music, index) => (
                      <tr
                        key={music._id}
                        onClick={() => navigate(`/player/${music._id}`)}
                        className="group cursor-pointer hover:bg-white/5 transition border-b border-white/5 last:border-b-0"
                      >
                        <td className="px-6 py-4 text-gray-500 w-12">
                          <span className="group-hover:hidden">{index + 1}</span>
                          <svg
                            className="w-4 h-4 text-white hidden group-hover:block"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={music.image || "https://via.placeholder.com/300?text=Music"}
                              alt={music.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                                  <p className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                                {music.title}
                              </p>
                              <p className="text-sm text-gray-500 sm:hidden truncate max-w-[200px]">
                                {music.artist?.username || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                          {music.artist?.username || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 text-sm">
                          {music.playedAt ? formatTimeAgo(music.playedAt) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

