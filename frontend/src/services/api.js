// frontend/src/services/api.js
/**
 * 此模块提供API调用功能。
 * 封装了与后端API的通信。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理错误响应
    const errorMessage = error.response?.data?.detail || '请求失败';
    console.error('API错误:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;