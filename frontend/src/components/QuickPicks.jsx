import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function QuickPicks({ musics }) {
  const navigate = useNavigate();

  if (!musics || musics.length === 0) return null;

  const picks = useMemo(() => {
    const copy = [...musics];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 8);
  }, [musics]);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Quick Picks</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {picks.map((music) => (
          <div
            key={music._id}
            onClick={() => navigate(`/player/${music._id}`)}
            className="group flex-shrink-0 w-40 sm:w-48 cursor-pointer snap-start"
          >
            <div className="relative rounded-2xl overflow-hidden mb-3">
              <img
                src={music.image || "https://via.placeholder.com/300?text=Music"}
                alt={music.title}
                className="w-full aspect-square object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">
                <div className="w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white truncate">{music.title}</h3>
            <p className="text-xs text-gray-500 truncate">
              {music.artist?.username || "Unknown"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

