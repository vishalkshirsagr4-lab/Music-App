import { useEffect, useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Albums() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState([]);
  const [songs, setSongs] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await API.get("/music");
        if (!cancelled) setSongs(res.data.musics || []);
      } catch {
        if (!cancelled) toast.error("Failed to load songs");
      }
      if (!cancelled) setFetching(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const toggleSong = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const createAlbum = async (e) => {
    e.preventDefault();

    if (!title) return toast.error("Enter album title");
    if (selected.length === 0) return toast.error("Select at least one song");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("musics", JSON.stringify(selected));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await API.post("/music/album", formData);

      toast.success("Album created successfully", {
        style: { background: "#282828", color: "#fff" },
      });

      setTitle("");
      setSelected([]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", {
        style: { background: "#282828", color: "#fff" },
      });
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => navigate("/artist")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Studio</span>
          </button>

          <div className="max-w-4xl mx-auto bg-[#181818] p-6 sm:p-8 rounded-2xl border border-white/5">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Create Album</h1>
              <p className="text-sm text-gray-500 mt-1">
                Group your songs into an album
              </p>
            </div>

            <form onSubmit={createAlbum} className="space-y-6">
              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Album Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter album title"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                />
              </div>

              {/* ALBUM COVER */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Album Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:border-[#1db954] transition">
                    <span className="block">Choose file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setImageFile(file);
                        if (file) setImagePreview(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-16 h-16 rounded-xl object-cover border border-white/10"
                    />
                  )}
                </div>
              </div>

              {/* SEARCH */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Songs
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search songs..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* SONG LIST */}
              <div>
                <h2 className="font-semibold text-white mb-3">
                  Select Songs
                </h2>

                {fetching ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="p-4 border border-white/5 rounded-xl animate-pulse bg-[#121212]"
                      >
                        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : songs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-[#121212] rounded-xl border border-dashed border-white/10">
                    <div className="text-3xl mb-2">🎵</div>
                    <p>No songs found. Upload some first!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-auto pr-1">
                    {songs
                      .filter((song) =>
                        song.title.toLowerCase().includes(search.toLowerCase()) ||
                        (song.artist?.username || "").toLowerCase().includes(search.toLowerCase())
                      )
                      .map((song) => {
                      const isSelected = selected.includes(song._id);

                      return (
                        <div
                          key={song._id}
                          onClick={() => toggleSong(song._id)}
                          className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center transition ${
                            isSelected
                              ? "bg-[#1db954]/10 border-[#1db954]"
                              : "bg-[#121212] border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            <img
                              src={song.image || "https://via.placeholder.com/40?text=♪"}
                              alt={song.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-white truncate">
                                {song.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {song.artist?.username || "You"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-lg ${
                              isSelected ? "text-[#1db954]" : "text-gray-600"
                            }`}
                          >
                            {isSelected ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* COUNT */}
              <p className="text-sm text-gray-400 font-medium">
                Selected: {selected.length} song{selected.length !== 1 ? "s" : ""}
              </p>

              {/* BUTTON */}
              <button
                disabled={loading}
                className="w-full bg-[#1db954] text-black py-3.5 rounded-full font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Album"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

