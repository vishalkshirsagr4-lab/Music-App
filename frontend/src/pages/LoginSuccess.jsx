import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    
    if (token && role) {
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user info to store full user object (ProtectedRoute expects it)
      const verifyUser = async () => {
        try {
          const response = fetch('https://music-app-0r90.onrender.com/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const res = await response;
          if (res.ok) {
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user.user));
            toast.success('Login successful!');
            
            // Role-based redirect
            switch (role) {
              case 'admin':
                navigate('/admin');
                break;
              case 'artist':
                navigate('/artist');
                break;
              default:
                navigate('/dashboard');
            }
          } else {
            toast.error('Login verification failed');
            localStorage.removeItem('token');
            navigate('/');
          }
        } catch (error) {
          toast.error('Login failed');
          localStorage.removeItem('token');
          navigate('/');
        }
      };
      
      verifyUser();
    } else {
      toast.error('Invalid login - missing token');
      navigate('/');
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
