import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout"; 

const I = ({ d, c: cls = "w-5 h-5" }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const MusicIcon = () => I({ d: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" });
const AlbumIcon = () => I({ d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" });
const SectionIcon = () => I({ d: "M4 6h16M4 12h16M4 18h16" });
const SearchIcon = () => I({ d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", c: "w-4 h-4" });
const PlusIcon = () => I({ d: "M12 4v16m8-8H4", c: "w-4 h-4" });
const TrashIcon = () => I({ d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", c: "w-4 h-4" });
const EditIcon = () => I({ d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", c: "w-4 h-4" });
const CloseIcon = () => I({ d: "M6 18L18 6M6 6l12 12" });
const Spinner = ({ cls = "w-5 h-5" }) => <div className={`${cls} border-2 border-current border-t-transparent rounded-full animate-spin`} />;

const SkeletonCard = () => (
  <div className="bg-[#181818] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-white/5" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" /> 
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  </div>
);
const EmptyState = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-xs">{subtitle}</p>
    {action}
  </div>
);
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-[#181818] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-full"><CloseIcon /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const ConfirmDialog = ({ open, title, message, action, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181818] rounded-2xl border border-white/10 w-full max-w-md p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button type="button" onClick={onCancel} disabled={loading} className="px-6 py-2.5 rounded-full font-medium text-sm bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => { action?.(); }} disabled={loading} className="px-6 py-2.5 rounded-full font-medium text-sm bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2">
            {loading ? <><Spinner cls="w-4 h-4" /> Deleting...</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ id, label, icon, activeTab, onSelect }) => (
  <button type="button" onClick={() => onSelect(id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition whitespace-nowrap ${activeTab === id ? "bg-[#1db954] text-black" : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"}`}>{icon}{label}</button>
);
const SearchInput = ({ placeholder, value, onChange }) => (
  <div className="relative flex-1"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></div>
    <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
  </div>
);
const SongCard = ({ song, onEdit, onDelete }) => (
  <div className="bg-[#181818] rounded-xl overflow-hidden group hover:bg-[#282828] transition-all duration-300 hover:shadow-lg hover:shadow-black/40">
    <div className="relative aspect-square">
      <img src={song.image || "https://via.placeholder.com/300?text=%E2%99%AA"} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
        <div className="flex gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(song); }} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition hover:scale-110"><EditIcon /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(song._id); }} className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:text-red-200 backdrop-blur-sm transition hover:scale-110"><TrashIcon /></button>
        </div>
      </div>
    </div>
    <div className="p-3"><h3 className="font-semibold text-white truncate text-sm group-hover:text-[#1db954] transition-colors">{song.title}</h3><p className="text-xs text-gray-500 mt-0.5 truncate">{song.genre || "No genre"} &bull; {song.movie || "No movie"}</p></div>
  </div>
);
const AlbumCard = ({ album, onEdit, onDelete }) => (
  <div className="bg-[#181818] rounded-xl overflow-hidden group hover:bg-[#282828] transition-all duration-300 hover:shadow-lg hover:shadow-black/40">
    <div className="relative aspect-square">
      <img src={album.image || "https://via.placeholder.com/300?text=%E2%99%AA"} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
        <div className="flex gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(album); }} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition hover:scale-110"><EditIcon /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(album._id); }} className="w-9 h-9 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:text-red-200 backdrop-blur-sm transition hover:scale-110"><TrashIcon /></button>
        </div>
      </div>
    </div>
    <div className="p-3"><h3 className="font-semibold text-white truncate text-sm group-hover:text-[#1db954] transition-colors">{album.title}</h3><p className="text-xs text-gray-500 mt-0.5">{album.musics?.length || 0} song{(album.musics?.length || 0) !== 1 ? "s" : ""}</p></div>
  </div>
);

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  });
  const userId = user?._id || user?.id;

  const [activeTab, setActiveTab] = useState("songs");
  const [mySongs, setMySongs] = useState([]);
  const [myAlbums, setMyAlbums] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [songSearch, setSongSearch] = useState("");
  const [albumSearch, setAlbumSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: user.username || "" });
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(user.avatar || null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  /*-- Confirm Dialog State --*/
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", action: null });
  const openConfirm = (title, message, action) => { setConfirmConfig({ title, message, action }); setConfirmOpen(true); };
  const closeConfirm = () => { setConfirmOpen(false); setConfirmLoading(false); };

  const openProfileModal = () => {
    setProfileForm({ username: user.username || "" });
    setProfileAvatarFile(null);
    setProfileAvatarPreview(user.avatar || null);
    setProfileModalOpen(true);
  };
  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setProfileSubmitting(false);
    setProfileAvatarFile(null);
  };
  const handleProfileAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileAvatarFile(file);
    setProfileAvatarPreview(file ? URL.createObjectURL(file) : user.avatar || null);
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.username.trim()) return toast.error("Username is required");
    setProfileSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("username", profileForm.username);
      if (profileAvatarFile) {
        fd.append("avatar", profileAvatarFile);
      }
      const res = await API.put("/auth/me", fd);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(res.data.message || "Profile updated");
      closeProfileModal();
    } catch (err) {
      console.error("Artist profile update error:", err);
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Update failed";
      toast.error(message);
      setProfileSubmitting(false);
    }
  };

  /*-- Fetchers --*/
  const loadMySongs = useCallback(async () => {
    setLoadingSongs(true);
    try {
      const res = await API.get("/music");
      const all = res.data?.musics || [];
      setAllSongs(all);
      setMySongs(all.filter((m) => {
        const artistId = m.artist?._id || m.artist?.id || m.artist;
        return String(artistId) === String(userId);
      }));
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to load songs"); }
    setLoadingSongs(false);
  }, [userId]);
  const loadMyAlbums = useCallback(async () => {
    setLoadingAlbums(true);
    try {
      const res = await API.get("/music/albums");
      const all = res.data?.albums || [];
      setMyAlbums(all.filter((a) => {
        const artistId = a.artist?._id || a.artist?.id || a.artist;
        return String(artistId) === String(userId);
      }));
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to load albums"); }
    setLoadingAlbums(false);
  }, [userId]);
  const loadSections = useCallback(async () => {
    setLoadingSections(true);
    try {
      const res = await API.get("/sections");
      const allSections = res.data?.sections || [];
      const visibleSections = user?.role === "admin"
        ? allSections
        : allSections.filter((s) => String(s.createdBy?._id || s.createdBy) === String(userId));
      setSections(visibleSections);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load sections");
    }
    setLoadingSections(false);
  }, [user?.role, userId]);
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadMySongs(), loadMyAlbums(), loadSections()]);
    };
    initialize();
  }, [loadMySongs, loadMyAlbums, loadSections]);

  /*-- SONG EDIT / DELETE --*/
  const [songEditModal, setSongEditModal] = useState(null);
  const [songEditForm, setSongEditForm] = useState({ title: "", genre: "", movie: "", sectionId: "", image: null });
  const [songEditPreview, setSongEditPreview] = useState(null);
  const [songSubmitting, setSongSubmitting] = useState(false);
  const openSongEdit = (song) => {
    setSongEditModal(song);
    setSongEditForm({
      title: song.title || "",
      genre: song.genre || "",
      movie: song.movie || "",
      sectionId: song.sectionId ? String(song.sectionId._id || song.sectionId) : "",
      image: null,
    });
    setSongEditPreview(song.image || null);
  };
  const closeSongEdit = () => { setSongEditModal(null); setSongEditForm({ title: "", genre: "", movie: "", sectionId: "", image: null }); setSongEditPreview(null); };
  const handleUpdateSong = async (e) => {
    e.preventDefault();
    if (!songEditForm.title.trim()) return toast.error("Title is required");
    setSongSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", songEditForm.title);
      fd.append("genre", songEditForm.genre);
      fd.append("movie", songEditForm.movie);
      fd.append("sectionId", songEditForm.sectionId || "");
      if (songEditForm.image) fd.append("image", songEditForm.image);
      const res = await API.put(`/music/${songEditModal._id}`, fd);
      toast.success(res.data?.message || "Song updated");
      setMySongs((p) => p.map((s) => (s._id === songEditModal._id ? { ...s, ...res.data.music } : s)));
      setAllSongs((p) => p.map((s) => (s._id === songEditModal._id ? { ...s, ...res.data.music } : s)));
      closeSongEdit();
    } catch (err) { toast.error(err?.response?.data?.message || "Update failed"); }
    setSongSubmitting(false);
  };
  const handleDeleteSong = (id) => {
    openConfirm("Delete Song", "This song will be permanently deleted and removed from all albums. This action cannot be undone.", async () => {
      setConfirmLoading(true);
      try {
        const res = await API.delete(`/music/${id}`);
        toast.success(res.data?.message || "Song deleted");
        setMySongs((p) => p.filter((s) => String(s._id) !== String(id)));
        setAllSongs((p) => p.filter((s) => String(s._id) !== String(id)));
        closeConfirm();
      } catch (err) { toast.error(err?.response?.data?.message || "Delete failed"); setConfirmLoading(false); }
    });
  };

  /*-- ALBUM CRUD --*/
  const [albumModal, setAlbumModal] = useState(null);
  const [albumForm, setAlbumForm] = useState({ title: "", musics: [], image: null });
  const [albumPreview, setAlbumPreview] = useState(null);
  const [albumSubmitting, setAlbumSubmitting] = useState(false);
  const [albumSongSearch, setAlbumSongSearch] = useState("");
  const openAlbumCreate = () => { setAlbumModal("create"); setAlbumForm({ title: "", musics: [], image: null }); setAlbumPreview(null); setAlbumSongSearch(""); };
  const openAlbumEdit = (album) => {
    setAlbumModal(album);
    setAlbumForm({
      title: album.title || "",
      musics: (album.musics || []).map((m) => String(m._id || m)),
      image: null,
    });
    setAlbumPreview(album.image || null);
    setAlbumSongSearch("");
  };
  const closeAlbumModal = () => { setAlbumModal(null); setAlbumForm({ title: "", musics: [], image: null }); setAlbumPreview(null); };
  const toggleAlbumSong = (id) => setAlbumForm((p) => {
    const songId = String(id);
    return {
      ...p,
      musics: p.musics.includes(songId)
        ? p.musics.filter((m) => String(m) !== songId)
        : [...p.musics, songId],
    };
  });
  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (!albumForm.title.trim()) return toast.error("Title is required");
    if (albumForm.musics.length === 0) return toast.error("Select at least one song");
    setAlbumSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", albumForm.title);
      fd.append("musics", JSON.stringify(albumForm.musics));
      if (albumForm.image) fd.append("image", albumForm.image);
      if (albumModal === "create") {
        const res = await API.post("/music/album", fd);
        toast.success(res.data?.message || "Album created"); setMyAlbums((p) => [res.data.album, ...p]);
      } else {
        const res = await API.put(`/music/albums/${albumModal._id}`, fd);
        toast.success(res.data?.message || "Album updated"); setMyAlbums((p) => p.map((a) => (String(a._id) === String(albumModal._id) ? res.data.album : a)));
      }
      closeAlbumModal();
    } catch (err) { toast.error(err?.response?.data?.message || "Save failed"); }
    setAlbumSubmitting(false);
  };
  const handleDeleteAlbum = (id) => {
    openConfirm("Delete Album", "This album will be permanently deleted. The songs inside will NOT be deleted.", async () => {
      setConfirmLoading(true);
      try {
        const res = await API.delete(`/music/albums/${id}`);
        toast.success(res.data?.message || "Album deleted");
        setMyAlbums((p) => p.filter((a) => String(a._id) !== String(id)));
        closeConfirm();
      } catch (err) { toast.error(err?.response?.data?.message || "Delete failed"); setConfirmLoading(false); }
    });
  };

  /*-- SECTION CRUD --*/
  const [sectionModal, setSectionModal] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: "", type: "custom", query: "", musics: [] });
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [sectionSongSearch, setSectionSongSearch] = useState("");
  const openSectionCreate = () => { setSectionModal("create"); setSectionForm({ title: "", type: "custom", query: "", musics: [] }); setSectionSongSearch(""); };
  const openSectionEdit = (section) => {
    setSectionModal(section);
    setSectionForm({
      title: section.title || "",
      type: section.type || "custom",
      query: section.query || "",
      musics: (section.musics || []).map((m) => String(m._id || m)),
    });
    setSectionSongSearch("");
  };
  const closeSectionModal = () => { setSectionModal(null); setSectionForm({ title: "", type: "custom", query: "", musics: [] }); setSectionSongSearch(""); };
  const toggleSectionSong = (id) => setSectionForm((p) => {
    const songId = String(id);
    return {
      ...p,
      musics: p.musics.includes(songId)
        ? p.musics.filter((m) => String(m) !== songId)
        : [...p.musics, songId],
    };
  });
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) return toast.error("Title is required");
    if (sectionForm.type === "manual" && sectionForm.musics.length === 0) return toast.error("Select at least one song for manual section");
    if (sectionForm.type !== "manual" && sectionForm.type !== "custom" && !sectionForm.query.trim()) return toast.error("Query is required");
    setSectionSubmitting(true);
    try {
      const payload = { title: sectionForm.title, type: sectionForm.type, query: sectionForm.type === "manual" ? "" : sectionForm.query, musics: sectionForm.type === "manual" ? sectionForm.musics : [] };
      if (sectionModal === "create") {
        const res = await API.post("/sections", payload);
        toast.success(res.data?.message || "Section created"); setSections((p) => [res.data.section, ...p]);
      } else {
        const res = await API.put(`/sections/${sectionModal._id}`, payload);
        toast.success(res.data?.message || "Section updated"); setSections((p) => p.map((s) => (String(s._id) === String(sectionModal._id) ? res.data.section : s)));
      }
      closeSectionModal();
    } catch (err) { toast.error(err?.response?.data?.message || "Save failed"); }
    setSectionSubmitting(false);
  };
  const handleDeleteSection = (id) => {
    openConfirm("Delete Section", "This section will be permanently deleted from the homepage. This action cannot be undone.", async () => {
      setConfirmLoading(true);
      try {
        const res = await API.delete(`/sections/${id}`);
        toast.success(res.data?.message || "Section deleted");
        setSections((p) => p.filter((s) => String(s._id) !== String(id)));
        closeConfirm();
      } catch (err) { toast.error(err?.response?.data?.message || "Delete failed"); setConfirmLoading(false); }
    });
  };

  /*-- Filters --*/
  const filteredSongs = mySongs.filter((s) => { const q = songSearch.toLowerCase(); return (s.title || "").toLowerCase().includes(q) || (s.genre || "").toLowerCase().includes(q) || (s.movie || "").toLowerCase().includes(q); });
  const filteredAlbums = myAlbums.filter((a) => (a.title || "").toLowerCase().includes(albumSearch.toLowerCase()));
  const filteredSections = sections.filter((s) => (s.title || "").toLowerCase().includes(sectionSearch.toLowerCase()) || (s.type || "").toLowerCase().includes(sectionSearch.toLowerCase()));

  /* ════════════════════════════════════════
     RENDER
     ════════════════════════════════════════ */
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-black to-black text-white">
        <div className="max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Artist Studio</h1>
              <p className="text-gray-400 text-sm">Manage your songs, albums, and homepage sections</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={openProfileModal} className="px-4 py-2 rounded-full bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition">Edit Profile</button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || "A"}&background=1db954&color=fff`} alt={user?.username} className="w-12 h-12 rounded-full object-cover border-2 border-[#1db954]" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <TabBtn id="songs" label="My Songs" icon={<MusicIcon />} activeTab={activeTab} onSelect={setActiveTab} />
            <TabBtn id="albums" label="My Albums" icon={<AlbumIcon />} activeTab={activeTab} onSelect={setActiveTab} />
            <TabBtn id="sections" label="Sections" icon={<SectionIcon />} activeTab={activeTab} onSelect={setActiveTab} />
          </div>

          {/* ========== SONGS TAB ========== */}
          {activeTab === "songs" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput placeholder="Search songs by title, genre, or movie..." value={songSearch} onChange={(e) => setSongSearch(e.target.value)} />
                <button type="button" onClick={() => navigate("/upload")} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition hover:scale-105 active:scale-95"><PlusIcon /> Upload Song</button>
              </div>
              {loadingSongs ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : mySongs.length === 0 ? (
                <EmptyState icon={<MusicIcon />} title="No songs yet" subtitle="Upload your first track to get started" action={<button onClick={() => navigate("/upload")} className="px-6 py-2.5 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition hover:scale-105">Upload Song</button>} />
              ) : filteredSongs.length === 0 ? (
                <EmptyState icon={<SearchIcon />} title="No matches" subtitle={`No songs found for "${songSearch}"`} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{filteredSongs.map((s) => <SongCard key={s._id} song={s} onEdit={openSongEdit} onDelete={handleDeleteSong} />)}</div>
              )}
            </div>
          )}

          {/* ========== ALBUMS TAB ========== */}
          {activeTab === "albums" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput placeholder="Search albums..." value={albumSearch} onChange={(e) => setAlbumSearch(e.target.value)} />
                <button type="button" onClick={openAlbumCreate} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition hover:scale-105 active:scale-95"><PlusIcon /> Create Album</button>
              </div>
              {loadingAlbums ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : myAlbums.length === 0 ? (
                <EmptyState icon={<AlbumIcon />} title="No albums yet" subtitle="Create your first album and add songs to it" action={<button onClick={openAlbumCreate} className="px-6 py-2.5 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition hover:scale-105">Create Album</button>} />
              ) : filteredAlbums.length === 0 ? (
                <EmptyState icon={<SearchIcon />} title="No matches" subtitle={`No albums found for "${albumSearch}"`} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{filteredAlbums.map((a) => <AlbumCard key={a._id} album={a} onEdit={openAlbumEdit} onDelete={handleDeleteAlbum} />)}</div>
              )}
            </div>
          )}

          {/* ========== SECTIONS TAB ========== */}
          {activeTab === "sections" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput placeholder="Search sections..." value={sectionSearch} onChange={(e) => setSectionSearch(e.target.value)} />
                <button type="button" onClick={openSectionCreate} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition hover:scale-105 active:scale-95"><PlusIcon /> Create Section</button>
              </div>
              {loadingSections ? (
                <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-[#181818] rounded-xl p-4 animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/10 rounded w-1/4" />
                    </div>
                  </div>
                ))}</div>
              ) : sections.length === 0 ? (
                <EmptyState icon={<SectionIcon />} title="No sections yet" subtitle="Create dynamic homepage sections like 'Trending' or 'Pop Hits'" action={<button onClick={openSectionCreate} className="px-6 py-2.5 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition hover:scale-105">Create Section</button>} />
              ) : filteredSections.length === 0 ? (
                <EmptyState icon={<SearchIcon />} title="No matches" subtitle={`No sections found for "${sectionSearch}"`} />
              ) : (
                <div className="space-y-3">{filteredSections.map((section) => (
                  <div key={section._id} className="bg-[#181818] rounded-xl p-4 flex items-center gap-4 hover:bg-[#282828] transition group">
                    <div className="w-12 h-12 bg-[#1db954]/10 rounded-lg flex items-center justify-center text-[#1db954] font-bold text-lg uppercase">{section.type?.[0] || "S"}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{section.title}</h3>
                      <p className="text-xs text-gray-500 capitalize">{section.type}{section.query ? ` • ${section.query}` : ""}{section.musics?.length ? ` • ${section.musics.length} songs` : ""}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openSectionEdit(section)} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition"><EditIcon /></button>
                      <button onClick={() => handleDeleteSection(section._id)} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-red-400 hover:text-red-200 transition"><TrashIcon /></button>
                    </div>
                  </div>
                ))}</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========== SONG EDIT MODAL ========== */}
      {songEditModal && (
        <Modal title="Edit Song" onClose={closeSongEdit}>
          <form onSubmit={handleUpdateSong} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input type="text" value={songEditForm.title} onChange={(e) => setSongEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                <input type="text" value={songEditForm.genre} onChange={(e) => setSongEditForm((p) => ({ ...p, genre: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Movie</label>
                <input type="text" value={songEditForm.movie} onChange={(e) => setSongEditForm((p) => ({ ...p, movie: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
              <select
                value={songEditForm.sectionId}
                onChange={(e) => setSongEditForm((p) => ({ ...p, sectionId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
              >
                <option value="" className="text-black">Choose a section</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id} className="text-black">
                    {section.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image <span className="text-gray-600">(optional)</span></label>
              <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition bg-white/5">
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; setSongEditForm((p) => ({ ...p, image: f })); if (f) setSongEditPreview(URL.createObjectURL(f)); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {songEditPreview ? (
                  <img src={songEditPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-gray-400">Drop cover image or click to browse</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={closeSongEdit} className="px-6 py-2.5 rounded-full font-medium text-sm bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition">Cancel</button>
              <button type="submit" disabled={songSubmitting} className="px-6 py-2.5 rounded-full font-medium text-sm bg-[#1db954] text-black hover:bg-[#1ed760] transition disabled:opacity-50 flex items-center gap-2">
                {songSubmitting ? <><Spinner cls="w-4 h-4" /> Saving...</> : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {albumModal && (
        <Modal title={albumModal === "create" ? "Create Album" : "Edit Album"} onClose={closeAlbumModal}>
          <form onSubmit={handleSaveAlbum} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Album Title</label>
              <input type="text" value={albumForm.title} onChange={(e) => setAlbumForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image <span className="text-gray-600">(optional)</span></label>
              <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition bg-white/5">
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; setAlbumForm((p) => ({ ...p, image: f })); if (f) setAlbumPreview(URL.createObjectURL(f)); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {albumPreview ? (
                  <img src={albumPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-gray-400">Drop cover image or click to browse</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Songs</label>
              <div className="relative mb-3">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></div>
                <input type="text" placeholder="Search your songs..." value={albumSongSearch} onChange={(e) => setAlbumSongSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {allSongs.filter((s) => {
                  const q = albumSongSearch.toLowerCase();
                  return !q || (s.title || "").toLowerCase().includes(q) || (s.genre || "").toLowerCase().includes(q);
                }).map((song) => (
                  <label key={song._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                    <input type="checkbox" checked={albumForm.musics.includes(song._id)} onChange={() => toggleAlbumSong(song._id)} className="w-4 h-4 accent-[#1db954] rounded" />
                    <img src={song.image || "https://via.placeholder.com/40?text=%E2%99%AA"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-gray-500">{song.genre || "No genre"}</p>
                    </div>
                  </label>
                ))}
                {allSongs.filter((s) => {
                  const q = albumSongSearch.toLowerCase();
                  return !q || (s.title || "").toLowerCase().includes(q) || (s.genre || "").toLowerCase().includes(q);
                }).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No songs match your search</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">{albumForm.musics.length} song{albumForm.musics.length !== 1 ? "s" : ""} selected</p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={closeAlbumModal} className="px-6 py-2.5 rounded-full font-medium text-sm bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition">Cancel</button>
              <button type="submit" disabled={albumSubmitting} className="px-6 py-2.5 rounded-full font-medium text-sm bg-[#1db954] text-black hover:bg-[#1ed760] transition disabled:opacity-50 flex items-center gap-2">
                {albumSubmitting ? <><Spinner cls="w-4 h-4" /> Saving...</> : (albumModal === "create" ? "Create Album" : "Save Changes")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {sectionModal && (
        <Modal title={sectionModal === "create" ? "Create Section" : "Edit Section"} onClose={closeSectionModal}>
          <form onSubmit={handleSaveSection} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Section Title</label>
              <input type="text" value={sectionForm.title} onChange={(e) => setSectionForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={sectionForm.type}
                  onChange={(e) =>
                    setSectionForm((p) => ({ ...p, type: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                >
                  <option value="custom" className="text-black">Custom</option>
                  <option value="genre" className="text-black">Genre</option>
                  <option value="trending" className="text-black">Trending</option>
                  <option value="movie" className="text-black">Movie</option>
                  <option value="manual" className="text-black">Manual (Pick Songs)</option>
                </select>
              </div>
              {sectionForm.type !== "manual" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Query</label>
                  <input type="text" value={sectionForm.query} onChange={(e) => setSectionForm((p) => ({ ...p, query: e.target.value }))} placeholder={sectionForm.type === "genre" ? "e.g. Pop" : sectionForm.type === "movie" ? "e.g. Inception" : "Search query"} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
                </div>
              )}
            </div>
            {sectionForm.type === "manual" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Songs</label>
                <div className="relative mb-3">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></div>
                  <input type="text" placeholder="Search songs..." value={sectionSongSearch} onChange={(e) => setSectionSongSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition" />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {allSongs.filter((s) => {
                    const q = sectionSongSearch.toLowerCase();
                    return !q || (s.title || "").toLowerCase().includes(q) || (s.genre || "").toLowerCase().includes(q);
                  }).map((song) => (
                    <label key={song._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                      <input type="checkbox" checked={sectionForm.musics.includes(song._id)} onChange={() => toggleSectionSong(song._id)} className="w-4 h-4 accent-[#1db954] rounded" />
                      <img src={song.image || "https://via.placeholder.com/40?text=%E2%99%AA"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{song.title}</p>
                        <p className="text-xs text-gray-500">{song.genre || "No genre"}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{sectionForm.musics.length} song{sectionForm.musics.length !== 1 ? "s" : ""} selected</p>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={closeSectionModal} className="px-6 py-2.5 rounded-full font-medium text-sm bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition">Cancel</button>
              <button type="submit" disabled={sectionSubmitting} className="px-6 py-2.5 rounded-full font-medium text-sm bg-[#1db954] text-black hover:bg-[#1ed760] transition disabled:opacity-50 flex items-center gap-2">
                {sectionSubmitting ? <><Spinner cls="w-4 h-4" /> Saving...</> : (sectionModal === "create" ? "Create Section" : "Save Changes")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {profileModalOpen && (
        <Modal title="Update Profile" onClose={closeProfileModal}>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1db954] focus:border-transparent transition"
                placeholder="Username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:border-[#1db954] transition text-center">
                  <span>{profileAvatarPreview ? "Change photo" : "Upload photo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarChange} />
                </label>
                {profileAvatarPreview && (
                  <img src={profileAvatarPreview} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover border border-white/10" />
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={closeProfileModal} className="px-6 py-2.5 rounded-full font-medium text-sm bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition">Cancel</button>
              <button type="submit" disabled={profileSubmitting} className="px-6 py-2.5 rounded-full font-medium text-sm bg-[#1db954] text-black hover:bg-[#1ed760] transition disabled:opacity-50 flex items-center gap-2">
                {profileSubmitting ? <><Spinner cls="w-4 h-4" /> Saving...</> : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        action={confirmConfig.action}
        onCancel={closeConfirm}
        loading={confirmLoading}
      />

    </Layout>
  );
}
