// frontend/src/components/Header.js
/**
 * 此组件用于展示应用的侧边导航栏。
 * 提供在不同页面之间的导航功能，支持收缩展开。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Layout, Menu } from 'antd';
import { HomeOutlined, LineChartOutlined, FundOutlined, FilterOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

/**
 * 侧边导航栏组件
 * @param {boolean} collapsed - 侧边栏是否收缩
 * @returns {JSX.Element} 侧边导航栏组件
 */
const Header = ({ collapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    if (currentPath.startsWith('/stocks')) return '2';
    if (currentPath.startsWith('/indices')) return '3';
    return '1';
  };

  return (
    <div className="app-header" style={{ padding: 0, height: '100vh' }}>
      <div className="logo" style={{ padding: '20px 0', textAlign: 'center' }}>
        <Link to="/">{collapsed ? '股市' : '股票数据可视化系统'}</Link>
      </div>
      <Menu
        theme="dark"
        mode="vertical"
        selectedKeys={[getSelectedKey()]}
        style={{ width: '100%' }}
        items={[
          {
            key: '1',
            icon: <HomeOutlined />,
            label: <Link to="/">首页</Link>,
          },
          {
            key: '2',
            icon: <LineChartOutlined />,
            label: <Link to="/stocks">股票列表</Link>,
          },
          {
            key: '3',
            icon: <FundOutlined />,
            label: <Link to="/indices">指数列表</Link>,
          },
          {
            key: '4',
            icon: <FilterOutlined />,
            label: <span>自选股票</span>,
            disabled: true,
          },
          {
            key: '5',
            icon: <LineChartOutlined />,
            label: <span>技术分析</span>,
            disabled: true,
          },
          {
            key: '6',
            icon: <FundOutlined />,
            label: <span>市场概览</span>,
            disabled: true,
          },
        ]}
      />
    </div>
  );
};

export default Header;