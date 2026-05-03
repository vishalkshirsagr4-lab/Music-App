import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";

// Lazy load all page components
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Player = lazy(() => import("./pages/Player"));
const AlbumPage = lazy(() => import("./pages/AlbumPage"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const RecentPage = lazy(() => import("./pages/RecentPage"));
const ArtistDashboard = lazy(() => import("./pages/ArtistDashboard"));
const UploadMusic = lazy(() => import("./pages/UploadMusic"));
const Albums = lazy(() => import("./pages/Albums"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));

// Loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AudioPlayerProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#282828",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/player/:id" element={<ProtectedRoute><Player /></ProtectedRoute>} />
            <Route path="/album/:id" element={<ProtectedRoute><AlbumPage /></ProtectedRoute>} />
            <Route path="/section/:id" element={<ProtectedRoute><SectionPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/recent" element={<ProtectedRoute><RecentPage /></ProtectedRoute>} />

            <Route path="/artist" element={
              <ProtectedRoute role="artist" allowAdmin={true}>
                <ArtistDashboard />
              </ProtectedRoute>
            } />

            <Route path="/upload" element={
              <ProtectedRoute role="artist" allowAdmin={true}>
                <UploadMusic />
              </ProtectedRoute>
            } />

            <Route path="/albums" element={
              <ProtectedRoute role="artist">
                <Albums />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
                  <div className="text-6xl mb-4">🚫</div>
                  <h1 className="text-3xl font-bold mb-2">404</h1>
                  <p className="text-gray-500 mb-6">Page not found</p>

                  <Link
                    to="/"
                    className="px-6 py-2.5 bg-[#1db954] text-black rounded-full font-bold hover:bg-[#1ed760] transition"
                  >
                    Go Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AudioPlayerProvider>
  );
}

export default App;
