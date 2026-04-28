import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { addToRecentlyPlayed } from "../utils/recentlyPlayed";
import { isLiked, toggleLike } from "../utils/likes";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentTrack,
    playlist,
    setPlaylist,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    volume,
    setVolume,
    setTrack,
    seekTo,
  } = useAudioPlayer();

  const [loading, setLoading] = useState(true);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [liked, setLiked] = useState(false);

  const music = currentTrack;

  // 🎧 Fetch Playlist + Set Track
  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true);
      try {
        const res = await API.get("/music");
        const musics = res.data.musics || [];

        setPlaylist(musics);

        const index = musics.findIndex((m) => m._id === id);
        const idx = index !== -1 ? index : 0;

        setCurrentIndex(idx);

        if (musics[idx]) {
          setTrack(musics[idx], idx);
          addToRecentlyPlayed(musics[idx]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [id]);

  // ❤️ Like sync
  useEffect(() => {
    if (music?._id) {
      setLiked(isLiked(music._id));
    }
  }, [music]);

  // 🎯 Related Songs
  useEffect(() => {
    if (!music?._id) return;

    const fetchRelated = async () => {
      try {
        const res = await API.get(`/music/related/${music._id}`);
        setRelatedSongs(res.data?.related || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRelated();
  }, [music]);

  // 🎚 Seek
  const handleSeek = (e) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) seekTo(value);
  };

  // 🔊 Volume
  const handleVolume = (e) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) setVolume(value);
  };

  const handleLike = () => {
    if (!music) return;
    setLiked(toggleLike(music._id));
  };

  const formatTime = (t) => {
    if (!t) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const albumArt =
    music?.image ||
    "https://via.placeholder.com/300x300/181818/FFFFFF?text=No+Cover";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );

  if (!music) return <div>No Song Found</div>;

  return (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex justify-center px-4 py-6">

    <div className="w-full max-w-6xl">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          ⬅ Back
        </button>

        <p className="text-gray-400 text-sm">Now Playing</p>

        <div />
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-2 gap-10 items-center">

        {/* 🎵 Album Section */}
        <div className="flex flex-col items-center">
          <img
            src={albumArt}
            alt={music.title}
            className="w-72 md:w-96 rounded-2xl shadow-2xl object-cover"
          />

          <div className="text-center mt-6">
            <h1 className="text-2xl font-bold">{music.title}</h1>
            <p className="text-gray-400">
              {music.artist?.username || "Unknown"}
            </p>

            <button
              onClick={handleLike}
              className="mt-3 text-lg hover:scale-110 transition"
            >
              {liked ? "❤️ Liked" : "🤍 Like"}
            </button>
          </div>
        </div>

        {/* 🎧 Controls Section */}
        <div className="w-full">

          {/* Progress */}
          <div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime || 0}
              onChange={handleSeek}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-10 mt-8 text-3xl">
            <button onClick={playPrev} className="hover:scale-110 transition">
              ⏮
            </button>

            <button
              onClick={togglePlay}
              className="bg-white text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button onClick={playNext} className="hover:scale-110 transition">
              ⏭
            </button>
          </div>

          {/* Volume */}
          <div className="mt-6">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              className="w-full accent-green-500"
            />
          </div>

        </div>
      </div>

      {/* 🎯 Related Songs */}
      <div className="mt-12">
        <h2 className="text-gray-400 mb-4 text-lg">Related Songs</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {relatedSongs.map((song, i) => (
            <div
              key={song._id}
              onClick={() => setTrack(song, i)}
              className="bg-gray-900 hover:bg-gray-800 p-3 rounded-xl cursor-pointer transition flex gap-3 items-center"
            >
              <img
                src={song.image || albumArt}
                className="w-14 h-14 rounded-lg object-cover"
              />

              <div>
                <p className="text-sm font-medium">{song.title}</p>
                <p className="text-xs text-gray-400">
                  {song.artist?.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  </div>
);
}