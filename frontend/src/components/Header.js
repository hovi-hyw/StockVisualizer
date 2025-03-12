// frontend/src/components/Header.js
/**
 * 此组件用于展示应用的顶部导航栏。
 * 提供在不同页面之间的导航功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Layout, Menu } from 'antd';
import { HomeOutlined, LineChartOutlined, FundOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

/**
 * 顶部导航栏组件
 * @returns {JSX.Element} 顶部导航栏组件
 */
const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    if (currentPath.startsWith('/stocks')) return '2';
    if (currentPath.startsWith('/indices')) return '3';
    return '1';
  };

  return (
    <AntHeader className="app-header">
      <div className="logo">
        <Link to="/">股票数据可视化系统</Link>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[getSelectedKey()]}
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
        ]}
      />
    </AntHeader>
  );
};

export default Header;