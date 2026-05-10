import axios from "axios";

const api = axios.create({
  baseURL: "https://globeot.duckdns.org/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");

      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;