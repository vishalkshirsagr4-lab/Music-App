import { useRef } from "react";
import MusicCard from "./MusicCard";
import SkeletonCard from "./SkeletonCard";

export default function SectionRow({ title, items = [], loading = false, icon = "🎵" }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[180px] w-[180px]">
              <SkeletonCard count={1} />
            </div>
          ))
        ) : (
          items.map((item) => (
            <div key={item._id} className="min-w-[180px] w-[180px] flex-shrink-0">
              <MusicCard music={item} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
