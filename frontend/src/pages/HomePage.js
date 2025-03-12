// frontend/src/pages/HomePage.js
/**
 * 首页组件
 * 展示系统概览和主要功能入口
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { StockOutlined, LineChartOutlined, FundOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

/**
 * 首页组件
 * @returns {JSX.Element} 首页组件
 */
const HomePage = () => {
  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>欢迎使用股票数据可视化系统</h1>
        <p>本系统提供实时股票数据、市场指数和专业的技术分析工具</p>
      </div>

      <Row gutter={[16, 16]} className="feature-section">
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="股票数据"
              value={3000}
              prefix={<StockOutlined />}
              suffix="支"
            />
            <div className="card-action">
              <Link to="/stocks">
                <Button type="primary">查看股票列表</Button>
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="市场指数"
              value={10}
              prefix={<FundOutlined />}
              suffix="个"
            />
            <div className="card-action">
              <Link to="/indices">
                <Button type="primary">查看指数数据</Button>
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="技术分析"
              value={"K线图"}
              prefix={<LineChartOutlined />}
            />
            <div className="card-action">
              <Link to="/stocks">
                <Button type="primary">开始分析</Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="info-section">
        <h2>系统特点</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card title="实时数据" bordered={false}>
              提供最新的股票价格、成交量等市场数据
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card title="技术分析" bordered={false}>
              专业的K线图表和技术指标分析工具
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card title="市场洞察" bordered={false}>
              全面的市场指数数据，助您把握市场动向
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomePage;