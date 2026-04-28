import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import MusicCard from "../components/MusicCard";
import AlbumCard from "../components/AlbumCard";
import Layout from "../components/Layout";

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";
  const [results, setResults] = useState({ songs: [], albums: [], artists: [], movies: [] });
  const [loading, setLoading] = useState(false);

  // RELATED SONGS STATES
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    API.get("/music/search?q=" + encodeURIComponent(q))
      .then(res => {
        const data = res.data || { songs: [], albums: [], artists: [], movies: [] };
        setResults(data);

        // Fetch related songs for the first search result
        if (data.songs && data.songs.length > 0) {
          const firstSong = data.songs[0];
          setRecLoading(true);
          API.get(`/music/related/${firstSong._id}`)
            .then(relRes => setRelatedSongs(relRes.data?.related || []))
            .catch(console.error)
            .finally(() => setRecLoading(false));
        } else {
          setRelatedSongs([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  const empty = !loading && q &&
    !results.songs.length && !results.albums.length &&
    !results.artists.length && !results.movies.length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-white mb-6">
            Search results for &quot;{q}&quot;
          </h1>
          {loading && <p className="text-gray-500">Searching...</p>}
          {empty && <p className="text-gray-500 text-center py-12">No results found.</p>}

          {!empty && !!results.songs.length && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {results.songs.map(s => <MusicCard key={s._id} music={s} />)}
              </div>
            </div>
          )}

          {/* RELATED SONGS SECTION */}
          {!loading && relatedSongs.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Related Songs</h2>
                <span className="text-sm text-gray-500">Based on top result</span>
              </div>
              {recLoading ? (
                <p className="text-gray-500">Loading related songs...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {relatedSongs.slice(0, 5).map(s => <MusicCard key={s._id} music={s} />)}
                </div>
              )}
            </div>
          )}

          {!empty && !!results.albums.length && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {results.albums.map(a => <AlbumCard key={a._id} album={a} />)}
              </div>
            </div>
          )}

          {!empty && !!results.movies.length && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Movies</h2>
              <div className="flex flex-wrap gap-3">
                {results.movies.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(m)}`)}
                    className="px-4 py-2 bg-[#181818] hover:bg-[#282828] border border-white/5 rounded-full text-sm text-gray-300 transition"
                  >
                    🎬 {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!empty && !!results.artists.length && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
              <div className="flex flex-wrap gap-4">
                {results.artists.map(a => (
                  <div key={a._id} className="flex items-center gap-3 bg-[#181818] p-4 rounded-xl">
                    <img
                      src={a.avatar || "https://ui-avatars.com/api/?name=" + a.username + "&background=1db954&color=fff"}
                      className="w-12 h-12 rounded-full object-cover"
                      alt={a.username}
                    />
                    <span className="text-white font-medium">{a.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
