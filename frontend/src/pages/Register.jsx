import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    toast("Sign up with Google on the login page!", {
      style: { background: "#282828", color: "#fff" },
    });
    navigate("/");
  }, [navigate]);

  return null;
}
