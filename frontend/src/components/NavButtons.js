// frontend/src/components/NavButtons.js
/**
 * 此组件用于展示页面右上角的导航按钮。
 * 提供在主页、股票和指数页面之间快速切换的功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Button, Space } from 'antd';
import { HomeOutlined, LineChartOutlined, FundOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

/**
 * 导航按钮组件
 * @returns {JSX.Element} 导航按钮组件
 */
const NavButtons = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="nav-buttons" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}>
      <Space>
        <Button 
          type={currentPath === '/' ? 'primary' : 'default'}
          icon={<HomeOutlined />}
          size="middle"
        >
          <Link to="/">主页</Link>
        </Button>
        <Button 
          type={currentPath === '/stocks' ? 'primary' : 'default'}
          icon={<LineChartOutlined />}
          size="middle"
        >
          <Link to="/stocks">股票</Link>
        </Button>
        <Button 
          type={currentPath === '/indices' ? 'primary' : 'default'}
          icon={<FundOutlined />}
          size="middle"
        >
          <Link to="/indices">指数</Link>
        </Button>
      </Space>
    </div>
  );
};

export default NavButtons;