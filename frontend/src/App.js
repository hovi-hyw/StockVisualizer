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
import Footer from './components/Footer';
import NavButtons from './components/NavButtons';

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
      <Layout>
        {/* 添加导航按钮组件 */}
        <NavButtons />
        <Content className="app-content" style={{ marginLeft: 0 }}>
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
    </Layout>
  );
}

export default App;