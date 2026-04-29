import { useNavigate } from "react-router-dom";

export default function AlbumCard({ album }) {
  const navigate = useNavigate();
  const avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(album.title || "Album") + "&background=1db954&color=fff&size=256";

  return (
    <div
      onClick={() => navigate("/album/" + album._id)}
      className="group cursor-pointer bg-[#181818] rounded-2xl overflow-hidden hover:bg-[#282828] transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
    >
      <div className="relative overflow-hidden">
        <img
          src={album.image || album.artist?.avatar || avatarUrl}
          alt={album.title}
          className="w-full aspect-square object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-11 sm:w-12 h-11 sm:h-12 bg-[#1db954] rounded-full flex items-center justify-center shadow-xl">
            <svg className="w-5 sm:w-6 h-5 sm:h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-1">{album.title}</h3>
        <p className="text-sm text-gray-400 truncate">{album.artist?.username}</p>
        <p className="text-xs text-gray-600 mt-1">
          {album.musics?.length || 0} song{album.musics?.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
