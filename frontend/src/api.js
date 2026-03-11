import axios from 'axios';

// 配置后端的 Axios 实例
const api = axios.create({
  // 请替换为你的实际后端地址和端口
  baseURL: 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 可选：添加请求拦截器，用于在每次请求时携带 Token（用于登录态）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegoria_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;