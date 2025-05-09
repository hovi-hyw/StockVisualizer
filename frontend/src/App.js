// frontend/src/App.js
/**
 * 应用主组件
 * 定义应用的整体布局和路由
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-22 - 添加主题切换功能
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// 导入页面组件
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import IndexPage from './pages/IndexPage';
import ETFListPage from './pages/ETFListPage';
import DetailPage from './pages/DetailPage';
import ETFDetailPage from './pages/ETFDetailPage';
import DocsPage from './pages/DocsPage';

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
// 主题切换按钮已移至NavButtons组件中

// 应用主组件包装器
const AppWithTheme = () => {
  const { theme: currentTheme } = useTheme();
  
  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout className={`app-layout ${currentTheme === 'dark' ? 'dark-mode' : ''}`}>
        <Layout>
          {/* 添加导航按钮组件 */}
          <NavButtons />
          <Content className="app-content" style={{ marginLeft: 0 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stocks" element={<StockPage />} />
              <Route path="/indices" element={<IndexPage />} />
              <Route path="/etfs" element={<ETFListPage />} />
              <Route path="/detail/etf/:symbol" element={<ETFDetailPage />} />
              <Route path="/detail/:type/:symbol" element={<DetailPage />} />
              <Route path="/docs" element={<DocsPage />} />
            </Routes>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

export default App;