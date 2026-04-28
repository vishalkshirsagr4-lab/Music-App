import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function MusicFeed({ sections, loading }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handlePlayAll = (songs) => {
    if (songs.length > 0) {
      navigate(`/player/${songs[0]._id}`);
    }
  };

  const handlePlaySong = (songId) => {
    navigate(`/player/${songId}`);
  };

  const toggleMenu = (songId) => {
    setOpenMenu(openMenu === songId ? null : songId);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-white/10 rounded w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-32" />
                    <div className="h-3 bg-white/10 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="bg-[#181818] p-12 rounded-2xl text-center">
        <div className="text-5xl mb-4">🎵</div>
        <p className="text-lg text-gray-400">No sections available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => {
        const songs = section.songs || section.musics || [];

        return (
          <section key={section._id} className="bg-[#181818]/50 rounded-2xl p-5 sm:p-6 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
                <button
                  onClick={() => navigate(`/section/${section._id}`)}
                  className="text-sm text-[#1db954] hover:underline mt-1"
                >
                  View section
                </button>
              </div>
              <div className="flex items-center gap-3">
                {songs.length > 0 && (
                  <button
                    onClick={() => handlePlayAll(songs)}
                    className="px-4 py-1.5 bg-[#1db954] text-black text-sm font-bold rounded-full hover:bg-[#1ed760] transition"
                  >
                    Play all
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {songs.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No songs in this section</p>
              ) : (
                songs.map((song, index) => (
                  <div
                    key={song._id}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer relative"
                    onClick={() => handlePlaySong(song._id)}
                  >
                    <div className="w-6 text-center text-gray-500 text-sm font-medium group-hover:hidden">
                      {index + 1}
                    </div>
                    <div className="w-6 hidden group-hover:flex justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>

                    <img
                      src={song.image || "https://via.placeholder.com/100?text=♪"}
                      alt={song.title}
                      className="w-14 h-14 rounded-lg object-cover bg-[#282828]"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{song.title}</h3>
                      <p className="text-gray-500 text-xs truncate">
                        {song.artist?.username || "Unknown"}
                        {song.playCount ? ` • ${song.playCount} plays` : ""}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(song._id);
                        }}
                        className="p-2 text-gray-500 hover:text-white transition rounded-full hover:bg-white/10"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>

                      {openMenu === song._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                            }}
                          />
                          <div className="absolute right-0 mt-1 w-40 bg-[#282828] rounded-xl shadow-2xl border border-white/5 py-1 z-20 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaySong(song._id);
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                            >
                              Play
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/player/${song._id}`);
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                            >
                              Go to player
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

