// frontend/src/components/HeroSection.js
/**
 * 顶部横幅组件
 * 展示系统标题和主要功能入口
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Space } from 'antd';
import { LineChartOutlined, FundOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * 顶部横幅组件
 * @returns {JSX.Element} 顶部横幅组件
 */
const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <Title>智能股票数据可视化平台</Title>
        <Paragraph>专业的市场分析工具，助您把握投资先机</Paragraph>
        <Space>
          <Button type="primary" size="large" icon={<LineChartOutlined />}>
            <Link to="/stocks">浏览股票</Link>
          </Button>
          <Button size="large" icon={<FundOutlined />}>
            <Link to="/indices">查看指数</Link>
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default HeroSection;