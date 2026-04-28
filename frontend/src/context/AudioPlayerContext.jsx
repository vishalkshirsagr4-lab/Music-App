import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AudioPlayerContext = createContext(null);

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const playNext = useCallback(() => {
    if (!currentTrack) return;

    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    const nextQueueIndex = queueIndex + 1;
    if (queue.length && nextQueueIndex < queue.length) {
      setQueueIndex(nextQueueIndex);
      setCurrentTrack(queue[nextQueueIndex]);
      return;
    }

    if (isShuffle && playlist.length > 1) {
      let r;
      do {
        r = Math.floor(Math.random() * playlist.length);
      } while (r === currentIndex && playlist.length > 1);
      setCurrentIndex(r);
      setCurrentTrack(playlist[r]);
      setQueueIndex(-1);
      return;
    }

    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setQueueIndex(-1);
  }, [currentTrack, currentIndex, isRepeat, isShuffle, playlist, queue, queueIndex]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setQueueIndex(-1);
  }, [currentIndex, playlist]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying]);

  const seekTo = useCallback((time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setTrack = useCallback((track, index = -1, nextQueueIndex = -1) => {
    if (index >= 0) {
      setCurrentIndex(index);
    }
    if (nextQueueIndex >= 0) {
      setQueueIndex(nextQueueIndex);
    }
    setCurrentTrack(track);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = "metadata";
    audio.volume = volume;
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoaded = () => setDuration(audio.duration || 0);
    const handleEnded = () => playNext();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack?.uri) return;
    if (audio.src !== currentTrack.uri) {
      audio.src = currentTrack.uri;
      audio.load();
    }
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, [currentTrack]);

  // 🎵 Media Session API Integration
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!currentTrack) return;

    const artwork = currentTrack.image
      ? [{ src: currentTrack.image, sizes: "512x512", type: "image/jpeg" }]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || "Unknown Title",
      artist: currentTrack.artist?.username || "Unknown Artist",
      album: currentTrack.album?.title || "",
      artwork,
    });
  }, [currentTrack]);

  // Update playback state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // Set action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const audio = audioRef.current;

    const handlePlay = () => {
      audio.play().catch(() => {});
      setIsPlaying(true);
    };

    const handlePause = () => {
      audio.pause();
      setIsPlaying(false);
    };

    const handleNext = () => playNext();
    const handlePrev = () => playPrev();
    const handleSeek = (details) => {
      if (details.seekTime != null) {
        seekTo(details.seekTime);
      }
    };

    navigator.mediaSession.setActionHandler("play", handlePlay);
    navigator.mediaSession.setActionHandler("pause", handlePause);
    navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
    navigator.mediaSession.setActionHandler("seekto", handleSeek);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [playNext, playPrev, seekTo]);

  const value = {
    audioRef,
    currentTrack,
    playlist,
    setPlaylist,
    currentIndex,
    setCurrentIndex,
    queue,
    setQueue,
    queueIndex,
    setQueueIndex,
    isPlaying,
    isShuffle,
    setIsShuffle,
    isRepeat,
    setIsRepeat,
    currentTime,
    duration,
    volume,
    setVolume,
    playNext,
    playPrev,
    togglePlay,
    seekTo,
    setTrack,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

