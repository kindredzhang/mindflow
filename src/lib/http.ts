import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 处理后端返回的错误
      const { data, status } = error.response;
      
      // 如果是 401 未授权，可能是 token 过期
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // 返回后端的错误信息
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    // 网络错误等
    return Promise.reject(new Error('网络错误，请稍后重试'));
  }
); 