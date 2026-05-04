import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (!token) {
      navigate('/login');
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('role', role || 'user');

    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/home');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-lg">Logging you in...</p>
      </div>
    </div>
  );
}
