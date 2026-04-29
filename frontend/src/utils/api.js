import axios from "axios";

const API = axios.create({
  baseURL: "https://music-app-0r90.onrender.com/api",
  withCredentials: true,
  timeout: 10000, // 10s timeout for email hangs
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