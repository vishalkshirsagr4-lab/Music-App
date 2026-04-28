export default function SkeletonCard({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#181818] rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-[#282828]" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-[#282828] rounded w-3/4" />
            <div className="h-3 bg-[#282828] rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

