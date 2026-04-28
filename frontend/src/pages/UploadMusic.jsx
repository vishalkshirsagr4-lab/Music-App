import { useState, useCallback, useEffect } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function UploadMusic() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState("");
  const [category, setCategory] = useState("");
  const [mood, setMood] = useState("");
  const [movie, setMovie] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState([]);
  const [musicFile, setMusicFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");
    if (!musicFile) return toast.error("Please select a music file");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("genre", genre);
    formData.append("category", category);
    formData.append("mood", mood);
    formData.append("movie", movie);
    formData.append("sectionId", sectionId);
    formData.append("music", musicFile);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    setLoading(true);

    try {
      const res = await API.post("/music/upload", formData);

      toast.success(res.data.message || "Music uploaded successfully", {
        style: { background: "#282828", color: "#fff" },
      });

      setTitle("");
      setSubtitle("");
      setGenre("");
      setCategory("");
      setMood("");
      setMovie("");
      setSectionId("");
      setMusicFile(null);
      setImageFile(null);
      setPreview(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Upload failed", {
        style: { background: "#282828", color: "#fff" },
      });
    }

    setLoading(false);
  };

  const handleMusicDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("audio/")) {
        setMusicFile(file);
      } else {
        toast.error("Please drop an audio file");
      }
    }
  }, []);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
      } else {
        toast.error("Please drop an image file");
      }
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const loadSections = async () => {
    try {
      const res = await API.get("/sections");
      setSections(res.data?.sections || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const musicFileName = musicFile?.name;
  const imageFileName = imageFile?.name;

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

          <div className="max-w-lg mx-auto">
            <form
              onSubmit={handleUpload}
              className="bg-[#181818] p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1db954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#1db954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Upload Music</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Share your sound with the world
                </p>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Song Title
                </label>
                <input
                  type="text"
                  placeholder="Enter song title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="Artist name or description"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Section
                  </label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  >
                    <option value="" className="text-black">
                      Choose a section
                    </option>

                    {sections.map((section) => (
                      <option
                        key={section._id}
                        value={section._id}
                        className="text-black"
                      >
                        {section.title}
                      </option>
                    ))}
                 </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pop, Rock"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Single, EP"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  >
                    <option value="" className="text-black">
                      Select mood
                    </option>
                    <option value="happy" className="text-black">Happy</option>
                    <option value="sad" className="text-black">Sad</option>
                    <option value="energetic" className="text-black">Energetic</option>
                    <option value="chill" className="text-black">Chill</option>
                    <option value="romantic" className="text-black">Romantic</option>
                    <option value="focus" className="text-black">Focus</option>
                    <option value="party" className="text-black">Party</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Movie
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Movie name"
                    value={movie}
                    onChange={(e) => setMovie(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* MUSIC FILE - DRAG & DROP */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Music File
                </label>
                <div
                  onDrop={handleMusicDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${
                    dragOver
                      ? "border-[#1db954] bg-[#1db954]/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    id="music-input"
                    onChange={(e) => setMusicFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg className="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-400 mb-1">
                    {musicFileName || "Drag & drop audio file here, or click to browse"}
                  </p>
                  <p className="text-xs text-gray-600">MP3, WAV, FLAC supported</p>
                </div>
                {musicFileName && (
                  <p className="text-[#1db954] text-xs mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {musicFileName}
                  </p>
                )}
              </div>

              {/* IMAGE FILE */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image <span className="text-gray-600">(optional)</span>
                </label>
                <div
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition bg-white/5"
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="image-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setImageFile(file);
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {preview ? (
                    <img
                      src={preview}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-xl mx-auto"
                    />
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-400">
                        {imageFileName || "Drop cover image or click to browse"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* BUTTON */}
              <button
                disabled={loading}
                className="w-full bg-[#1db954] text-black py-3.5 rounded-full font-bold hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Music"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

