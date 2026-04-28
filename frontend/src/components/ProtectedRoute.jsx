import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import API from "../utils/api";

export default function ProtectedRoute({ children, role, allowAdmin }) {
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await API.get("/auth/me");
        const freshUser = res.data.user;
        localStorage.setItem("user", JSON.stringify(freshUser));
        setVerifiedUser(freshUser);
      } catch (err) {
        // Backend verification failed
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





