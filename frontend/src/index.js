// frontend/src/index.js
/**
 * 应用入口文件
 * 负责将React应用渲染到DOM中
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // 移除严格模式以避免组件重复渲染和重复API请求
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
);