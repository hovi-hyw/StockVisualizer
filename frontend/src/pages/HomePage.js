// frontend/src/pages/HomePage.js
/**
 * 首页组件
 * 展示系统概览和主要功能入口
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-16 - 添加实时市场指数数据
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Statistic, Button, Typography, Divider, Space, List, Spin } from 'antd';
import { LineChartOutlined, FundOutlined, RiseOutlined, FallOutlined, StockOutlined, AreaChartOutlined } from '@ant-design/icons';
import MarketHotspot from '../components/MarketHotspot';
import MarketNewsCard from '../components/MarketNewsCard';
import { getMarketIndices } from '../services/marketService';

const { Title, Paragraph, Text } = Typography;

/**
 * 首页组件
 * @returns {JSX.Element} 首页组件
 */
const HomePage = () => {
  // 市场指数数据状态
  const [marketIndices, setMarketIndices] = useState({
    '000001': { name: '上证指数', current: 0, change_percent: 0 },
    '399001': { name: '深证成指', current: 0, change_percent: 0 },
    '399006': { name: '创业板指', current: 0, change_percent: 0 },
    '000688': { name: '科创50', current: 0, change_percent: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取市场指数数据
  useEffect(() => {
    const fetchMarketIndices = async () => {
      try {
        setLoading(true);
        const data = await getMarketIndices();
        if (data) {
          setMarketIndices(data);
        }
        setError(null);
      } catch (err) {
        console.error('非交易日，无法获取实时数据:', err);
        setError('非交易日，无法获取实时数据');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketIndices();

    // 设置定时刷新（每60秒刷新一次）
    const intervalId = setInterval(fetchMarketIndices, 60000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);
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
        {error && <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : (
                <Statistic 
                  title={marketIndices['000001']?.name || '上证指数'} 
                  value={marketIndices['000001']?.current || 0} 
                  precision={2}
                  valueStyle={{ 
                    color: marketIndices['000001']?.change_percent >= 0 ? '#cf1322' : '#3f8600' 
                  }}
                  prefix={marketIndices['000001']?.change_percent >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  suffix={`${marketIndices['000001']?.change_percent >= 0 ? '+' : ''}${marketIndices['000001']?.change_percent.toFixed(2)}%`}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : (
                <Statistic 
                  title={marketIndices['399001']?.name || '深证成指'} 
                  value={marketIndices['399001']?.current || 0} 
                  precision={2}
                  valueStyle={{ 
                    color: marketIndices['399001']?.change_percent >= 0 ? '#cf1322' : '#3f8600' 
                  }}
                  prefix={marketIndices['399001']?.change_percent >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  suffix={`${marketIndices['399001']?.change_percent >= 0 ? '+' : ''}${marketIndices['399001']?.change_percent.toFixed(2)}%`}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : (
                <Statistic 
                  title={marketIndices['399006']?.name || '创业板指'} 
                  value={marketIndices['399006']?.current || 0} 
                  precision={2}
                  valueStyle={{ 
                    color: marketIndices['399006']?.change_percent >= 0 ? '#cf1322' : '#3f8600' 
                  }}
                  prefix={marketIndices['399006']?.change_percent >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  suffix={`${marketIndices['399006']?.change_percent >= 0 ? '+' : ''}${marketIndices['399006']?.change_percent.toFixed(2)}%`}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : (
                <Statistic 
                  title={marketIndices['000688']?.name || '科创50'} 
                  value={marketIndices['000688']?.current || 0} 
                  precision={2}
                  valueStyle={{ 
                    color: marketIndices['000688']?.change_percent >= 0 ? '#cf1322' : '#3f8600' 
                  }}
                  prefix={marketIndices['000688']?.change_percent >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  suffix={`${marketIndices['000688']?.change_percent >= 0 ? '+' : ''}${marketIndices['000688']?.change_percent.toFixed(2)}%`}
                />
              )}
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
              <MarketNewsCard />
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