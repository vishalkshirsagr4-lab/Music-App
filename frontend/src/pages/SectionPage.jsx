import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Layout from "../components/Layout";
import { addToRecentlyPlayed } from "../utils/recentlyPlayed";

export default function SectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSection() {
      try {
        const res = await API.get(`/sections/${id}`);
        if (!cancelled) {
          setSection(res.data.section);
        }
      } catch (err) {
        if (!cancelled) {
          setSection(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSection();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const playSong = (music) => {
    addToRecentlyPlayed(music);
    navigate(`/player/${music._id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            Loading section...
          </div>
        </div>
      </Layout>
    );
  }

  if (!section) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-400 mb-4 text-lg">Section not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 bg-[#1db954] text-black rounded-full font-medium hover:bg-[#1ed760] transition"
          >
            Back to dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const songs = section.musics || [];
  const filteredSongs = songs.filter((song) => {
    const q = search.toLowerCase();
    return (
      song.title.toLowerCase().includes(q) ||
      (song.artist?.username || "").toLowerCase().includes(q) ||
      (song.genre || "").toLowerCase().includes(q) ||
      (song.movie || "").toLowerCase().includes(q)
    );
  });

  const coverImage =
    songs[0]?.image ||
    section.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(section.title || "Section")}&background=1db954&color=fff&size=256`;

  const sectionLabel = section.type
    ? section.type.charAt(0).toUpperCase() + section.type.slice(1)
    : "Section";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black">
        <div className="max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            <div className="bg-[#181818] rounded-3xl p-6 border border-white/5 shadow-xl shadow-black/20">
              <img
                src={coverImage}
                alt={section.title}
                className="w-full h-72 rounded-3xl object-cover mb-6"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(section.title || "Section")}&background=1db954&color=fff&size=256`;
                }}
              />
              <div className="space-y-4 text-white">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{sectionLabel}</p>
                  <h1 className="text-3xl font-bold mt-2">{section.title}</h1>
                </div>
                <div className="text-sm text-gray-400 space-y-2">
                  {section.query && (
                    <p>Query: <span className="text-white">{section.query}</span></p>
                  )}
                  <p>{songs.length} song{songs.length !== 1 ? "s" : ""}</p>
                  <p>Type: <span className="text-white capitalize">{section.type}</span></p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#181818] rounded-3xl p-6 border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Songs</h2>
                    <p className="text-gray-500 text-sm mt-1">Search inside this section</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm">{sectionLabel}</span>
                    {section.query && (
                      <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-sm">Query: {section.query}</span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search songs, artists, genre or movie..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="bg-[#181818] rounded-3xl p-6 border border-white/5">
                {filteredSongs.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3">🎧</div>
                    <p>No songs match your search.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSongs.map((song, idx) => (
                      <button
                        key={song._id}
                        type="button"
                        onClick={() => playSong(song)}
                        className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl bg-[#121212] hover:bg-white/5 transition"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#000]"><img src={song.image || "https://via.placeholder.com/80?text=♪"} alt={song.title} className="w-full h-full object-cover" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{song.title}</p>
                          <p className="text-gray-400 text-sm truncate">{song.artist?.username || "Unknown"}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {song.genre && <div>{song.genre}</div>}
                          {song.movie && <div>{song.movie}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
