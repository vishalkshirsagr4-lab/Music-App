import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import API from "../utils/api";

export default function ProtectedRoute({ children, role, allowAdmin }) {
  const [verifiedUser, setVerifiedUser] = useState(() => {
    // Use cached user immediately to avoid redirect flicker/loops right after login.
    const cached = localStorage.getItem("user");
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      // Prevent redirect loops caused by race conditions during login-success.
      // If we already have a token, keep trying to verify until backend responds.
      const tokenInStorage = localStorage.getItem("token");

      try {
        if (!tokenInStorage) {
          setVerifiedUser(null);
          return;
        }

        const res = await API.get("/auth/me");
        const freshUser = res.data.user;
        localStorage.setItem("user", JSON.stringify(freshUser));
        setVerifiedUser(freshUser);
      } catch (err) {
        // Backend verification failed (token invalid/expired/missing cookie)
        // Don't clear token aggressively: first, attempt to still render based on cached user.
        // Clearing token can cause an immediate redirect loop right after login.
        const cachedUserRaw = localStorage.getItem("user");
        const cachedUser = cachedUserRaw ? JSON.parse(cachedUserRaw) : null;

        if (cachedUser) {
          setVerifiedUser(cachedUser);
          return;
        }

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setVerifiedUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [location.pathname]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!verifiedUser) {
    return <Navigate to="/" replace />;
  }

  if (role && verifiedUser.role !== role) {
    // Allow admin to access artist pages if allowAdmin is true
    if (allowAdmin && verifiedUser.role === "admin") {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}





