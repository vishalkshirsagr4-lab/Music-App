import { useEffect, useState } from "react";
import API from "../utils/api";
import MusicCard from "../components/MusicCard";
import SkeletonCard from "../components/SkeletonCard";
import QuickPicks from "../components/QuickPicks";
import SectionRow from "../components/SectionRow";
import AlbumCard from "../components/AlbumCard";
import MusicFeed from "../components/MusicFeed";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [musics, setMusics] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [musicRes, albumRes, topRes, sectionsRes] = await Promise.all([
          API.get("/music"),
          API.get("/music/albums"),
          API.get("/music/top?limit=8"),
          API.get("/sections/feed"),
        ]);
        if (!cancelled) {
          setMusics(musicRes.data?.musics || []);
          setAlbums(albumRes.data?.albums || []);
          setTopSongs(topRes.data?.musics || []);
          setSections(sectionsRes.data?.sections || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.log(err.response?.data || err.message);
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-transparent opacity-50" />
          <div className="relative max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Discover Music
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-md sm:max-w-xl">
              Explore songs and albums created by talented artists around the world
            </p>
          </div>
        </div>

        <div className="max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          {/* QUICK PICKS */}
          {!loading && musics.length > 0 && <QuickPicks musics={musics} />}

          {/* TOP SONGS */}
          {!loading && topSongs.length > 0 && (
            <SectionRow title="Top Songs" items={topSongs} icon="🔥" />
          )}

          {/* DYNAMIC SECTIONS - Nested List View */}
          {!loading && sections.length > 0 && (
            <div className="mb-14">
              <MusicFeed sections={sections} loading={loading} />
            </div>
          )}

          {/* SONGS SECTION */}
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Songs</h2>
              <span className="text-sm text-gray-500">{musics.length} tracks</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                <SkeletonCard count={5} />
              </div>
            ) : musics.length === 0 ? (
              <div className="bg-[#181818] p-12 rounded-2xl text-gray-500 text-center">
                <div className="text-5xl mb-4">🎵</div>
                <p className="text-lg">No songs available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {musics.map((m) => (
                  <MusicCard key={m._id} music={m} />
                ))}
              </div>
            )}
          </section>

          {/* ALBUMS SECTION */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Albums</h2>
              <span className="text-sm text-gray-500">{albums.length} albums</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                <SkeletonCard count={4} />
              </div>
            ) : albums.length === 0 ? (
              <div className="bg-[#181818] p-12 rounded-2xl text-gray-500 text-center">
                <div className="text-5xl mb-4">📀</div>
                <p className="text-lg">No albums found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {albums.map((a) => (
                  <AlbumCard key={a._id} album={a} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

