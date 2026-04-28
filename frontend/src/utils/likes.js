const LIKES_KEY = 'music_app_likes';

export function getLikes() {
  try {
    const data = localStorage.getItem(LIKES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isLiked(musicId) {
  const likes = getLikes();
  return likes.includes(musicId);
}

export function toggleLike(musicId) {
  const likes = getLikes();
  const index = likes.indexOf(musicId);
  if (index > -1) {
    likes.splice(index, 1);
  } else {
    likes.push(musicId);
  }
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  return index === -1; // returns true if now liked
}

