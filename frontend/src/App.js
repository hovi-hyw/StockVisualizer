// frontend/src/App.js
/**
 * 应用主组件
 * 定义应用的整体布局和路由
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';

// 导入页面组件
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import IndexPage from './pages/IndexPage';
import DetailPage from './pages/DetailPage';
import StockKlineDemo from './pages/StockKlineDemo';

// 导入布局组件
import Header from './components/Header';
import Footer from './components/Footer';

// 导入样式
import './App.css';

const { Content } = Layout;

/**
 * 应用主组件
 * @returns {JSX.Element} 应用主组件
 */
function App() {
  return (
    <Layout className="app-layout">
      <Header />
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stocks" element={<StockPage />} />
          <Route path="/indices" element={<IndexPage />} />
          <Route path="/detail/:type/:symbol" element={<DetailPage />} />
          <Route path="/stock-kline-demo" element={<StockKlineDemo />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;