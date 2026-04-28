const RECENT_KEY = 'music_app_recently_played';
const MAX_RECENT = 10;

export function getRecentlyPlayed() {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToRecentlyPlayed(music) {
  if (!music || !music._id) return;
  const recent = getRecentlyPlayed().filter(r => r._id !== music._id);
  recent.unshift({
    _id: music._id,
    title: music.title,
    artist: music.artist,
    image: music.image,
    uri: music.uri,
    playedAt: new Date().toISOString(),
  });
  if (recent.length > MAX_RECENT) {
    recent.pop();
  }
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

export function clearRecentlyPlayed() {
  localStorage.removeItem(RECENT_KEY);
}

export function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

