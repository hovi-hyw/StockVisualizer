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
import { Row, Col, Card, Statistic, Button, Typography, Divider, Space, List, Spin, Input, message } from 'antd';
import { LineChartOutlined, FundOutlined, RiseOutlined, FallOutlined, StockOutlined, AreaChartOutlined, FileTextOutlined, GithubOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import MarketHotspot from '../components/MarketHotspot';
import MarketNewsCard from '../components/MarketNewsCard';
import ContactAuthor from '../components/ContactAuthor';
import { getMarketIndices } from '../services/marketService';
import { getStockList } from '../services/stockService';

const { Search } = Input;

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
  
  // 股票搜索相关状态
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 搜索股票结果
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  
  
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteStocks');
    if (savedFavorites) {
      try {
        setFavoriteStocks(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('解析自选股数据失败:', e);
      }
    }
  }, []);

  
  const searchStocks = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setSearching(true);
    setShowSearchResults(true);
    
    try {
      const savedFavorites = localStorage.getItem('favoriteStocks');
      const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      
      const filtered = favorites.filter(item => 
        item.symbol.includes(value) || 
        item.name.includes(value)
      );
      
      if (filtered.length > 0) {
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
        message.info('未找到相关自选股');
      }
    } catch (error) {
      console.error('搜索自选股失败:', error);
      message.error('搜索失败，请稍后重试');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  // 点击页面其他区域关闭搜索结果
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
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
        <Row gutter={[24, 24]} style={{ width: '90%', margin: '0 auto' }}>
          <Col xs={24} sm={12} lg={12}>
            <Card 
              className="feature-card" 
              hoverable 
              onClick={() => {
                window.location.href = '/stocks';
              }}
            >
              <AreaChartOutlined className="feature-icon" />
              <Title level={4}>专业K线图表</Title>
              <Paragraph>通过专业的K线图表和技术指标，深入分析股票历史表现和未来趋势</Paragraph>
              <div style={{ textAlign: 'right' }}>
                <Button type="link">查看股票 →</Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card 
              className="feature-card" 
              hoverable 
              onClick={() => {
                window.location.href = '/indices';
              }}
            >
              <FundOutlined className="feature-icon" />
              <Title level={4}>市场指数追踪</Title>
              <Paragraph>关注主要市场指数变化，把握整体市场走势和行业板块表现</Paragraph>
              <div style={{ textAlign: 'right' }}>
                <Button type="link">查看指数 →</Button>
              </div>
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

      {/* 底部链接区域 */}
      <div className="about-section">
        <Title level={2} className="section-title">更多信息</Title>
        <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <div style={{ textAlign: 'center' }}>
                <ContactAuthor />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <div style={{ textAlign: 'center' }}>
                <Button type="link" icon={<FileTextOutlined />}>
                  <Link to="/docs">使用帮助</Link>
                </Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <div style={{ textAlign: 'center' }}>
                <Button type="link" icon={<GithubOutlined />}>
                  <a href="https://github.com/akfamily/akshare" target="_blank" rel="noopener noreferrer">数据来源</a>
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomePage;