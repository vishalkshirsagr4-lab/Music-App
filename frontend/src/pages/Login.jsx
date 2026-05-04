import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle success/error from OAuth redirect
  useEffect(() => {
    const loginSuccess = searchParams.get('login');
    const error = searchParams.get('error');
    
    if (loginSuccess === 'success') {
      toast.success("Logged in successfully with Google!", {
        style: { background: "#282828", color: "#fff" },
      });
      navigate('/dashboard');
    } else if (error) {
      toast.error("Login failed. Please try again.", {
        style: { background: "#282828", color: "#fff" },
      });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#121212] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/5 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Music</h2>
          <p className="text-gray-400 text-lg">Continue with Google</p>
        </div>

        <a 
          href="https://music-app-0r90.onrender.com/auth/google"
          className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-white/10 transition-all duration-200 group"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center mt-8 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-sm text-gray-500 uppercase">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
          <a 
            href="https://music-app-0r90.onrender.com/api/auth/forgot-password" 
            className="block hover:text-white transition text-[#1db954]"
          >
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
