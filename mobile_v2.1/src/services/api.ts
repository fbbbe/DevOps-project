// 기본 설정 (baseURL 등) 이 포함된 API 서비스 모듈

// 예시
import axios from "axios";

const api = axios.create({
  baseURL: "https://your-server.com/ords/hr",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 전 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
