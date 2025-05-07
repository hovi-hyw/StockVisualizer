// frontend/src/pages/HomePage.js
/**
 * 首页组件
 * 展示系统概览和主要功能入口
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-16 - 添加实时市场指数数据
 * 更新: 2025-03-25 - 修改布局，删除部分列，扩大热门行业和概念板块宽度，添加交互功能
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Button, 
  Typography, 
  Divider, 
  Space, 
  List, 
  Spin, 
  Input, 
  message, 
  Tag,
  Tooltip
} from 'antd';
import { LineChartOutlined, FundOutlined, RiseOutlined, FallOutlined, StockOutlined, AreaChartOutlined, FileTextOutlined, GithubOutlined, SearchOutlined, PlusOutlined, FireOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ContactAuthor from '../components/ContactAuthor';
import { getMarketIndices } from '../services/marketService';
import { getStockList } from '../services/stockService';
import { getHotIndustries, getConceptSectors, getIndustryStocks, getConceptStocks } from '../services/marketDataService';
import { formatLargeNumber } from '../utils/formatters';

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
  
  // 热门行业和概念板块状态
  const [hotIndustries, setHotIndustries] = useState([]);
  const [hotConcepts, setHotConcepts] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [industryStocks, setIndustryStocks] = useState([]);
  const [conceptStocks, setConceptStocks] = useState([]);
  const [hotspotLoading, setHotspotLoading] = useState(true);
  const [hotspotError, setHotspotError] = useState(null);
  
  // 状态管理 - 排序相关
  const [industrySortField, setIndustrySortField] = useState('change_percent'); // 默认按涨跌幅排序
  const [industrySortOrder, setIndustrySortOrder] = useState('desc'); // 默认降序
  const [conceptSortField, setConceptSortField] = useState('change_percent'); // 默认按涨跌幅排序
  const [conceptSortOrder, setConceptSortOrder] = useState('desc'); // 默认降序
  
  
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
  
  // 检查是否在交易时间内（9:00-16:00）
  const isTradeTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    // 交易时间：9:00-16:00
    return currentTime >= 900 && currentTime <= 1600;
  };
  
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
        console.error('获取市场指数数据失败:', err);
        setError('获取市场指数数据失败');
      } finally {
        setLoading(false);
      }
    };

    // 首次加载数据
    fetchMarketIndices();

    // 设置定时刷新（每60秒刷新一次）
    const intervalId = setInterval(() => {
      // 只在交易时间内更新数据
      if (isTradeTime()) {
        fetchMarketIndices();
      }
    }, 60000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);
  
  // 获取热门行业和概念板块数据
  useEffect(() => {
    const fetchHotspotData = async () => {
      try {
        setHotspotLoading(true);
        // 并行获取热门行业和概念板块数据
        const [industriesData, conceptsData] = await Promise.all([
          getHotIndustries(),
          getConceptSectors()
        ]);
        
        setHotIndustries(industriesData);
        setHotConcepts(conceptsData);
        
        // 默认选中第一个行业和概念
        if (industriesData.length > 0) {
          setSelectedIndustry(industriesData[0]);
          // 使用akshare的stock_board_concept_cons_em方法获取该行业的个股数据
          try {
            const data = await getIndustryStocks(industriesData[0].name);
            // 根据当前排序字段和顺序排序数据
            const sortedData = sortStockData(data, industrySortField, industrySortOrder);
            setIndustryStocks(sortedData);
          } catch (error) {
            console.error('获取行业个股数据失败:', error);
            setIndustryStocks([]);
          }
        }
        
        if (conceptsData.length > 0) {
          setSelectedConcept(conceptsData[0]);
          // 使用akshare的stock_board_concept_cons_em方法获取该概念的个股数据
          try {
            const data = await getConceptStocks(conceptsData[0].name);
            // 根据当前排序字段和顺序排序数据
            const sortedData = sortStockData(data, conceptSortField, conceptSortOrder);
            setConceptStocks(sortedData);
          } catch (error) {
            console.error('获取概念个股数据失败:', error);
            setConceptStocks([]);
          }
        }
        
        setHotspotError(null);
      } catch (err) {
        console.error('获取市场热点数据失败:', err);
        setHotspotError('获取市场热点数据失败，请稍后再试');
      } finally {
        setHotspotLoading(false);
      }
    };

    // 首次加载数据
    fetchHotspotData();

    // 设置定时刷新（每5分钟刷新一次）
    const intervalId = setInterval(() => {
      // 只在交易时间内更新数据
      if (isTradeTime()) {
        fetchHotspotData();
      }
    }, 5 * 60 * 1000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [industrySortField, industrySortOrder, conceptSortField, conceptSortOrder]);

  // 处理行业点击事件
  const handleIndustryClick = async (industry) => {
    setSelectedIndustry(industry);
    setHotspotLoading(true);
    
    try {
      // 使用akshare的stock_board_concept_cons_em方法获取该行业的个股数据
      // 数据格式为：{code, name, change_percent, amount, turnover_rate}
      const data = await getIndustryStocks(industry.name);
      
      // 根据当前排序字段和顺序排序数据
      const sortedData = sortStockData(data, industrySortField, industrySortOrder);
      setIndustryStocks(sortedData);
    } catch (error) {
      console.error('获取行业个股数据失败:', error);
      setIndustryStocks([]);
      message.error(`获取${industry.name}相关个股数据失败`);
    } finally {
      setHotspotLoading(false);
    }
  };
  
  // 处理概念点击事件
  const handleConceptClick = async (concept) => {
    setSelectedConcept(concept);
    setHotspotLoading(true);
    
    try {
      // 使用akshare的stock_board_concept_cons_em方法获取该概念的个股数据
      // 数据格式为：{code, name, change_percent, amount, turnover_rate}
      const data = await getConceptStocks(concept.name);
      
      // 根据当前排序字段和顺序排序数据
      const sortedData = sortStockData(data, conceptSortField, conceptSortOrder);
      setConceptStocks(sortedData);
    } catch (error) {
      console.error('获取概念个股数据失败:', error);
      setConceptStocks([]);
      message.error(`获取${concept.name}相关个股数据失败`);
    } finally {
      setHotspotLoading(false);
    }
  };
  
  // 排序股票数据
  const sortStockData = (data, field, order) => {
    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // 处理涨跌幅和振幅的特殊情况（带有+或-符号和%符号）
      if (field === 'change_percent' || field === 'amplitude') {
        // 确保值是字符串类型再使用字符串方法
        if (typeof aValue === 'number') {
          aValue = aValue.toString();
        } else if (aValue === undefined || aValue === null) {
          aValue = '0';
        }
        
        if (typeof bValue === 'number') {
          bValue = bValue.toString();
        } else if (bValue === undefined || bValue === null) {
          bValue = '0';
        }
        
        // 现在安全地使用字符串方法
        aValue = parseFloat((typeof aValue === 'string' ? aValue.replace('%', '').replace('+', '') : aValue));
        bValue = parseFloat((typeof bValue === 'string' ? bValue.replace('%', '').replace('+', '') : bValue));
      }
      
      // 处理成交额的特殊情况（带有亿或万单位）
      if (field === 'amount') {
        // 确保值是字符串类型再使用字符串方法
        if (typeof aValue === 'number') {
          aValue = aValue.toString();
        } else if (aValue === undefined || aValue === null) {
          aValue = '0';
        }
        
        if (typeof bValue === 'number') {
          bValue = bValue.toString();
        } else if (bValue === undefined || bValue === null) {
          bValue = '0';
        }
        
        // 现在安全地使用字符串方法
        const aIsString = typeof aValue === 'string';
        const bIsString = typeof bValue === 'string';
        
        const aHasYi = aIsString && aValue.includes('亿');
        const aHasWan = aIsString && aValue.includes('万');
        const bHasYi = bIsString && bValue.includes('亿');
        const bHasWan = bIsString && bValue.includes('万');
        
        aValue = parseFloat(aIsString ? aValue.replace('亿', '').replace('万', '') : aValue) * (aHasYi ? 10000 : (aHasWan ? 1 : 1));
        bValue = parseFloat(bIsString ? bValue.replace('亿', '').replace('万', '') : bValue) * (bHasYi ? 10000 : (bHasWan ? 1 : 1));
      }
      
      // 处理换手率的特殊情况（带有%符号）
      if (field === 'turnover_rate') {
        // 确保值是字符串类型再使用字符串方法
        if (typeof aValue === 'number') {
          aValue = aValue.toString();
        } else if (aValue === undefined || aValue === null) {
          aValue = '0';
        }
        
        if (typeof bValue === 'number') {
          bValue = bValue.toString();
        } else if (bValue === undefined || bValue === null) {
          bValue = '0';
        }
        
        // 现在安全地使用字符串方法
        aValue = parseFloat(typeof aValue === 'string' ? aValue.replace('%', '') : aValue);
        bValue = parseFloat(typeof bValue === 'string' ? bValue.replace('%', '') : bValue);
      }
      
      // 确保最终值是数字类型，如果不是则默认为0
      aValue = isNaN(aValue) ? 0 : aValue;
      bValue = isNaN(bValue) ? 0 : bValue;
      
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };
  
  // 处理行业股票排序
  const handleIndustrySortChange = (field) => {
    // 如果点击的是当前排序字段，则切换排序顺序
    if (field === industrySortField) {
      const newOrder = industrySortOrder === 'asc' ? 'desc' : 'asc';
      setIndustrySortOrder(newOrder);
      setIndustryStocks(sortStockData(industryStocks, field, newOrder));
    } else {
      // 如果点击的是新字段，则设置为降序
      setIndustrySortField(field);
      setIndustrySortOrder('desc');
      setIndustryStocks(sortStockData(industryStocks, field, 'desc'));
    }
  };
  
  // 处理概念股票排序
  const handleConceptSortChange = (field) => {
    // 如果点击的是当前排序字段，则切换排序顺序
    if (field === conceptSortField) {
      const newOrder = conceptSortOrder === 'asc' ? 'desc' : 'asc';
      setConceptSortOrder(newOrder);
      setConceptStocks(sortStockData(conceptStocks, field, newOrder));
    } else {
      // 如果点击的是新字段，则设置为降序
      setConceptSortField(field);
      setConceptSortOrder('desc');
      setConceptStocks(sortStockData(conceptStocks, field, 'desc'));
    }
  };
  
  // 根据涨跌幅返回不同颜色
  const getChangeColor = (change) => {
    // 确保change是字符串类型
    const changeStr = String(change || '0');
    // 将字符串转换为数字进行比较
    const value = parseFloat(changeStr.replace('%', '').replace('+', ''));
    // 保持涨跌颜色一致，不受主题影响
    return value >= 0 ? '#cf1322' : '#3f8600';
  };

  // 根据热度返回标签颜色
  const getHotTagColor = (hot) => {
    // 保持热度标签颜色一致，不受主题影响
    if (hot >= 90) return 'volcano';
    if (hot >= 80) return 'orange';
    return 'gold';
  };
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
        
        {/* 市场热点区域 - 热门行业和概念板块 */}
        <div style={{ marginTop: '40px' }}>
          {/* 热门行业部分 */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            {/* 热门行业列表 */}
            <Col xs={24} sm={8} md={6}>
              <Card 
                title={
                  <Space>
                    <Title level={4}><FireOutlined style={{ color: '#ff4d4f' }} /> 热门行业</Title>
                    <Tooltip 
                      title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>基于该行业成交量、换手率和涨跌幅综合计算，数值越高表示关注度越高。</Typography.Paragraph>}
                      placement="topRight"
                      overlayStyle={{ maxWidth: '300px' }}
                    >
                      <QuestionCircleOutlined className="info-icon" />
                    </Tooltip>
                  </Space>
                }
                className="hotspot-card"
                bordered={false}
                style={{ height: '600px' }} // 设置固定高度
              >
                {hotspotLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="加载市场热点数据中..." />
                  </div>
                ) : hotspotError ? (
                  <div style={{ color: 'orange', marginBottom: '10px' }}>{hotspotError}</div>
                ) : (
                  <List
                    dataSource={hotIndustries}
                    renderItem={(item) => (
                      <List.Item 
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedIndustry && selectedIndustry.name === item.name ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                          borderLeft: selectedIndustry && selectedIndustry.name === item.name ? '3px solid #1890ff' : 'none',
                          paddingLeft: selectedIndustry && selectedIndustry.name === item.name ? '10px' : '13px'
                        }}
                        onClick={() => handleIndustryClick(item)}
                      >
                        <div className="hotspot-item" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{item.name}</Text>
                          <Space>
                            <Text style={{ color: getChangeColor(item.change) }}>
                              {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                            </Text>
                            <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                          </Space>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            {/* 热门行业相关个股 */}
            <Col xs={24} sm={16} md={18}>
              <Card 
                title={
                  <Space>
                    <Title level={4}>{selectedIndustry ? `${selectedIndustry.name}相关个股` : '行业相关个股'}</Title>
                  </Space>
                }
                className="hotspot-card"
                bordered={false}
                style={{ height: '600px', display: 'flex', flexDirection: 'column' }} // 设置固定高度并允许内部滚动
              >
                {hotspotLoading && !selectedIndustry ? ( // 初始加载时显示
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="加载中..." />
                  </div>
                ) : industryStocks.length > 0 ? (
                  <div style={{ flexGrow: 1, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100% - 56px)' }}>
                    <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              onClick={() => handleIndustrySortChange('name')}
                            >
                              <span>股票名称</span>
                              {industrySortField === 'name' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {industrySortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              onClick={() => handleIndustrySortChange('code')}
                            >
                              <span>代码</span>
                              {industrySortField === 'code' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {industrySortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleIndustrySortChange('change_percent')}
                            >
                              <span>涨跌幅</span>
                              {industrySortField === 'change_percent' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {industrySortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleIndustrySortChange('amplitude')}
                            >
                              <span>振幅</span>
                              {industrySortField === 'amplitude' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {industrySortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleIndustrySortChange('amount')}
                            >
                              <span>成交额</span>
                              {industrySortField === 'amount' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {industrySortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleIndustrySortChange('turnover_rate')}
                            >
                              <span>换手率</span>
                              {industrySortField === 'turnover_rate' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {industrySortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {industryStocks.map((stock, index) => (
                          <tr key={stock.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '8px 4px' }}>
                              <Link to={`/detail/stock/${stock.code.startsWith('6') ? 'sh' : 'sz'}${stock.code}`} style={{ color: 'inherit' }}>
                                <Text strong>{stock.name}</Text>
                              </Link>
                            </td>
                            <td style={{ padding: '8px 4px' }}>
                              <Text type="secondary">{stock.code}</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text style={{ color: getChangeColor(stock.change_percent) }}>{stock.change_percent}%</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text type="secondary">{stock.amplitude}%</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text type="secondary">{formatLargeNumber(stock.amount)}</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text type="secondary">{stock.turnover_rate}%</Text>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">{selectedIndustry ? `暂无${selectedIndustry.name}相关个股数据` : '请先选择一个行业'}</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* 概念板块列表 */}
            <Col xs={24} sm={8} md={6}>
              <Card 
                title={
                  <Space>
                    <Title level={4}><RiseOutlined style={{ color: '#52c41a' }} /> 概念板块</Title>
                    <Tooltip 
                      title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>基于该概念板块的讨论度、相关股票表现和资金流入综合计算，数值越高表示关注度越高。</Typography.Paragraph>}
                      placement="topRight"
                      overlayStyle={{ maxWidth: '300px' }}
                    >
                      <QuestionCircleOutlined className="info-icon" />
                    </Tooltip>
                  </Space>
                }
                className="hotspot-card"
                bordered={false}
                style={{ height: '600px' }} // 设置固定高度
              >
                {hotspotLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="加载市场热点数据中..." />
                  </div>
                ) : hotspotError ? (
                  <div style={{ color: 'orange', marginBottom: '10px' }}>{hotspotError}</div>
                ) : (
                  <List
                    dataSource={hotConcepts}
                    renderItem={(item) => (
                      <List.Item 
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedConcept && selectedConcept.name === item.name ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                          borderLeft: selectedConcept && selectedConcept.name === item.name ? '3px solid #1890ff' : 'none',
                          paddingLeft: selectedConcept && selectedConcept.name === item.name ? '10px' : '13px'
                        }}
                        onClick={() => handleConceptClick(item)}
                      >
                        <div className="hotspot-item" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{item.name}</Text>
                          <Space>
                            <Text style={{ color: getChangeColor(item.change) }}>
                              {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                            </Text>
                            <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                          </Space>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            {/* 概念板块相关个股 */}
            <Col xs={24} sm={16} md={18}>
              <Card 
                title={
                  <Space>
                    <Title level={4}>{selectedConcept ? `${selectedConcept.name}相关个股` : '概念相关个股'}</Title>
                  </Space>
                }
                className="hotspot-card"
                bordered={false}
                style={{ height: '600px', display: 'flex', flexDirection: 'column' }} // 设置固定高度并允许内部滚动
              >
                {hotspotLoading && !selectedConcept ? ( // 初始加载时显示
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="加载中..." />
                  </div>
                ) : conceptStocks.length > 0 ? (
                  <div style={{ flexGrow: 1, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100% - 56px)' }}>
                    <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              onClick={() => handleConceptSortChange('name')}
                            >
                              <span>股票名称</span>
                              {conceptSortField === 'name' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {conceptSortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              onClick={() => handleConceptSortChange('code')}
                            >
                              <span>代码</span>
                              {conceptSortField === 'code' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {conceptSortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleConceptSortChange('change_percent')}
                            >
                              <span>涨跌幅</span>
                              {conceptSortField === 'change_percent' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {conceptSortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleConceptSortChange('amplitude')}
                            >
                              <span>振幅</span>
                              {conceptSortField === 'amplitude' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {conceptSortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleConceptSortChange('amount')}
                            >
                              <span>成交额</span>
                              {conceptSortField === 'amount' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {conceptSortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <div 
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              onClick={() => handleConceptSortChange('turnover_rate')}
                            >
                              <span>换手率</span>
                              {conceptSortField === 'turnover_rate' && (
                                <span style={{ marginLeft: '4px' }}>
                                  {conceptSortOrder === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {conceptStocks.map((stock, index) => (
                          <tr key={stock.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '8px 4px' }}>
                              <Link to={`/detail/stock/${stock.code.startsWith('6') ? 'sh' : 'sz'}${stock.code}`} style={{ color: 'inherit' }}>
                                <Text strong>{stock.name}</Text>
                              </Link>
                            </td>
                            <td style={{ padding: '8px 4px' }}>
                              <Text type="secondary">{stock.code}</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text style={{ color: getChangeColor(stock.change_percent) }}>{stock.change_percent}%</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text type="secondary">{stock.amplitude}%</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text type="secondary">{formatLargeNumber(stock.amount)}</Text>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                              <Text type="secondary">{stock.turnover_rate}%</Text>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">{selectedConcept ? `暂无${selectedConcept.name}相关个股数据` : '请先选择一个概念'}</Text>
                  </div>
                )}
              </Card>
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
}

export default HomePage;