import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { addToRecentlyPlayed } from "../utils/recentlyPlayed";

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;
  const albumArtistId = album?.artist?._id || album?.artist?.id || album?.artist;
  const canDeleteAlbum = Boolean(
    currentUser &&
      (currentUser.role === "admin" ||
        String(currentUserId) === String(albumArtistId))
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await API.get(`/music/albums/${id}`);
        if (!cancelled) setAlbum(res.data.album);
      } catch {
        if (!cancelled) setAlbum(null);
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const playSong = (music) => {
    addToRecentlyPlayed(music);
    navigate(`/player/${music._id}`);
  };

  const handleDeleteAlbum = async () => {
    if (!window.confirm("Are you sure you want to delete this album?")) {
      return;
    }

    setDeleting(true);
    try {
      await API.delete(`/music/albums/${id}`);
      toast.success("Album deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete album", {
        style: { background: "#282828", color: "#fff" },
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            Loading album...
          </div>
        </div>
      </Layout>
    );
  }

  if (!album) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
          <div className="text-6xl mb-4">📀</div>
          <p className="text-gray-400 mb-4 text-lg">Album not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 bg-[#1db954] text-black rounded-full font-medium hover:bg-[#1ed760] transition"
          >
            Go Home
          </button>
        </div>
      </Layout>
    );
  }

  const coverImage =
    album.image ||
    album.artist?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      album.title || "Album"
    )}&background=1db954&color=fff&size=256`;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black">
        {/* ALBUM BANNER */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-transparent opacity-60" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md w-fit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8">
              <div className="shrink-0">
                <img
                  src={coverImage}
                  alt={album.title}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover shadow-2xl shadow-black/50"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      album.title
                    )}&background=1db954&color=fff&size=256`;
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-2">Album</p>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 truncate">
                  {album.title}
                </h1>
                <div className="flex items-center gap-3 text-gray-400">
                  <img
                    src={album.artist?.avatar || `https://ui-avatars.com/api/?name=${album.artist?.username || "A"}&background=1db954&color=fff`}
                    alt={album.artist?.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-medium text-white hover:underline cursor-pointer">
                    {album.artist?.username}
                  </span>
                  <span>•</span>
                  <span>{album.musics?.length || 0} song{album.musics?.length !== 1 ? "s" : ""}</span>
                </div>
                {canDeleteAlbum && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleDeleteAlbum}
                      disabled={deleting}
                      className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete Album"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SONGS LIST */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-[#121212] rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 sm:px-6 py-3 border-b border-white/5 text-sm text-gray-500 uppercase tracking-wider">
              <span className="w-8 text-center">#</span>
              <span>Title</span>
              <span className="hidden sm:block">Artist</span>
              <span className="w-16 text-right">Play</span>
            </div>

            {album.musics?.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-2">🎵</div>
                <p>No songs in this album yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {album.musics.map((m, idx) => (
                  <div
                    key={m._id}
                    onClick={() => playSong(m)}
                    className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 sm:px-6 py-3 hover:bg-white/5 transition cursor-pointer items-center"
                  >
                    <span className="w-8 text-center text-gray-500 group-hover:text-white text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={m.image || "https://via.placeholder.com/40?text=♪"}
                        alt={m.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-[#1db954] transition">
                          {m.title}
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:block text-gray-400 text-sm truncate">
                      {m.artist?.username || album.artist?.username}
                    </span>
                    <div className="w-16 flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                        <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

