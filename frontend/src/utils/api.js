import axios from "axios";

const API = axios.create({
  // ProtectedRoute/axios calls use: API.get('/auth/me') etc.
  baseURL: "https://music-app-0r90.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default API;

