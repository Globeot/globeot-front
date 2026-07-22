import axios from "axios";

const api = axios.create({
  baseURL: "https://globetback.duckdns.org/api/v1",
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
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const hadToken = !!localStorage.getItem("accessToken");
      localStorage.removeItem("accessToken");

      if (hadToken) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;