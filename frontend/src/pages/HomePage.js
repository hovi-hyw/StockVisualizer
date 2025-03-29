// frontend/src/pages/HomePage.js
/**
 * 首页组件
 * 展示系统概览和主要功能入口
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Statistic, Button, Typography, Divider, Space, List } from 'antd';
import { LineChartOutlined, FundOutlined, RiseOutlined, StockOutlined, AreaChartOutlined } from '@ant-design/icons';
import MarketHotspot from '../components/MarketHotspot';

const { Title, Paragraph, Text } = Typography;

/**
 * 首页组件
 * @returns {JSX.Element} 首页组件
 */
const HomePage = () => {
  return (
    <div className="home-page">
      {/* 顶部横幅区域 */}
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

      {/* 功能卡片区域 */}
      <div className="features-section">
        <Title level={2} className="section-title">核心功能</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="feature-card" hoverable>
              <StockOutlined className="feature-icon" />
              <Title level={4}>实时股票数据</Title>
              <Paragraph>获取最新的股票价格、交易量和市值数据，助您实时掌握市场动态</Paragraph>
              <Button type="link">
                <Link to="/stocks">查看股票 →</Link>
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="feature-card" hoverable>
              <AreaChartOutlined className="feature-icon" />
              <Title level={4}>专业K线图表</Title>
              <Paragraph>通过专业的K线图表和技术指标，深入分析股票历史表现和未来趋势</Paragraph>
              <Button type="link">
                <Link to="/stock-kline-demo">体验K线图 →</Link>
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="feature-card" hoverable>
              <FundOutlined className="feature-icon" />
              <Title level={4}>市场指数追踪</Title>
              <Paragraph>关注主要市场指数变化，把握整体市场走势和行业板块表现</Paragraph>
              <Button type="link">
                <Link to="/indices">查看指数 →</Link>
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 市场概览区域 */}
      <div className="market-overview-section">
        <Title level={2} className="section-title">市场概览</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="上证指数" 
                value={3250.52} 
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<RiseOutlined />}
                suffix="+1.2%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="深证成指" 
                value={12568.23} 
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<RiseOutlined />}
                suffix="+0.8%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="创业板指" 
                value={2856.32} 
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<RiseOutlined />}
                suffix="+1.5%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="科创50" 
                value={1256.78} 
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<RiseOutlined />}
                suffix="+0.6%"
              />
            </Card>
          </Col>
        </Row>
        
        {/* 市场热点区域 */}
        <div style={{ marginTop: '40px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <MarketHotspot />
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={<Title level={4}>市场资讯</Title>}
                className="news-card"
                bordered={false}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { title: '央行发布2023年第四季度货币政策执行报告', date: '2023-02-28' },
                    { title: '两市震荡上行，创业板指涨超1%', date: '2023-02-28' },
                    { title: '证监会：进一步深化资本市场改革', date: '2023-02-27' },
                    { title: '新能源汽车板块持续走强，多股涨停', date: '2023-02-27' },
                    { title: '外资连续三日净流入A股市场', date: '2023-02-26' }
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<a href="#">{item.title}</a>}
                        description={item.date}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* 关于我们区域 */}
      <div className="about-section">
        <Title level={2} className="section-title">关于平台</Title>
        <Paragraph className="about-text">
          股票数据可视化系统是一个专业的金融数据分析平台，致力于为投资者提供全面、直观的市场数据和分析工具。
          我们整合了多种数据源，提供实时的股票价格、交易量、技术指标和市场指数，帮助您做出更明智的投资决策。
        </Paragraph>
      </div>
    </div>
  );
};

export default HomePage;