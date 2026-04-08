import axios from "axios";

const api = axios.create({
  baseURL: "https://globeot.duckdns.org/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  console.log("요청 URL:", config.baseURL, config.url, config.params);
  console.log("토큰:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;