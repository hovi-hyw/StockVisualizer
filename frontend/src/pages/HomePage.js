// frontend/src/pages/HomePage.js
/**
 * 首页组件
 * 展示系统概览和主要功能入口
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-16 - 添加实时市场指数数据
 * 更新: 2025-03-25 - 修改布局，删除部分列，扩大热门行业和概念板块宽度，添加交互功能
 * 更新: 2025-03-26 - 拆分组件，提高代码可维护性
 * 更新: 2025-03-27 - 继续拆分组件，添加ValueETFList和StockFunds组件
 */

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Space, Spin, Tag, Tooltip, message } from 'antd';
import { FileTextOutlined, GithubOutlined, FireOutlined, RiseOutlined, FallOutlined, PlusOutlined, QuestionCircleOutlined, LineChartOutlined, FundOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatLargeNumber } from '../utils/formatters';
import ContactAuthor from '../components/common/ContactAuthor';
import { getHotIndustries, getConceptSectors, getIndustryStocks, getConceptStocks } from '../services/marketDataService';

// 导入拆分后的组件
import HeroSection from '../components/home/HeroSection';
import MarketOverview from '../components/home/MarketOverview';
import HotIndustries from '../components/home/HotIndustries';
import ConceptSectors from '../components/home/ConceptSectors';
import ValueETFList from '../components/home/ValueETFList';
import StockFunds from '../components/home/StockFunds';

const { Title, Text, Paragraph } = Typography;

/**
 * 首页组件
 * @returns {JSX.Element} 首页组件
 */
const HomePage = () => {
  
  // 自选股状态
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

  // 检查是否在交易时间内（9:00-16:00）
  const isTradeTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    // 交易时间：9:00-16:00
    return currentTime >= 900 && currentTime <= 1600;
  };

  
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
      <HeroSection />


      {/* 市场概览区域 */}
      <div className="market-overview-section">
        <Title level={2} className="section-title">市场概览</Title>
        <MarketOverview />
        
        {/* 市场热点区域 - 热门行业和概念板块 */}
        <div style={{ marginTop: '40px' }}>
          <Title level={2} className="section-title">市场热点</Title>
          {/* 热门行业部分 */}
          <HotIndustries 
            hotIndustries={hotIndustries}
            industryStocks={industryStocks}
            selectedIndustry={selectedIndustry}
            loading={hotspotLoading}
            error={hotspotError}
            onIndustryClick={handleIndustryClick}
            onSortChange={handleIndustrySortChange}
            sortField={industrySortField}
            sortOrder={industrySortOrder}
            onAddToFavorites={(stock) => {
              const savedFavorites = localStorage.getItem('favoriteStocks');
              const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
              // 创建包含完整股票代码的对象
              const stockWithFullCode = {
                ...stock,
                symbol: `${stock.code.startsWith('6') ? 'sh' : 'sz'}${stock.code}`
              };
              if (!favorites.some(item => item.code === stock.code)) {
                favorites.push(stockWithFullCode);
                localStorage.setItem('favoriteStocks', JSON.stringify(favorites));
                // 更新React状态，这样不需要刷新页面就能看到新添加的股票
                setFavoriteStocks(favorites);
                message.success(`已将${stock.name}添加到自选股`);
              } else {
                message.info(`${stock.name}已在自选股中`);
              }
            }}
          />
          
          {/* 概念板块部分 */}
          <ConceptSectors 
            hotConcepts={hotConcepts}
            conceptStocks={conceptStocks}
            selectedConcept={selectedConcept}
            loading={hotspotLoading}
            error={hotspotError}
            onConceptClick={handleConceptClick}
            onSortChange={handleConceptSortChange}
            sortField={conceptSortField}
            sortOrder={conceptSortOrder}
            onAddToFavorites={(stock) => {
              const savedFavorites = localStorage.getItem('favoriteStocks');
              const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
              // 创建包含完整股票代码的对象
              const stockWithFullCode = {
                ...stock,
                symbol: `${stock.code.startsWith('6') ? 'sh' : 'sz'}${stock.code}`
              };
              if (!favorites.some(item => item.code === stock.code)) {
                favorites.push(stockWithFullCode);
                localStorage.setItem('favoriteStocks', JSON.stringify(favorites));
                // 更新React状态，这样不需要刷新页面就能看到新添加的股票
                setFavoriteStocks(favorites);
                message.success(`已将${stock.name}添加到自选股`);
              } else {
                message.info(`${stock.name}已在自选股中`);
              }
            }}
          />
        </div>
      </div>

      {/* 价值ETF和热门基金区域 */}
      <div style={{ marginTop: '40px' }}>
        <Title level={2} className="section-title">投资工具</Title>
        <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
          <Col xs={24} md={12}>
            <ValueETFList />
          </Col>
          <Col xs={24} md={12}>
            <StockFunds />
          </Col>
        </Row>
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
                  <a href="/dao.html" target="_blank">交易之道</a>
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