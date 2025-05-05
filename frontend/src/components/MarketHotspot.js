// frontend/src/components/MarketHotspot.js
/**
 * 此组件用于展示市场热点板块。
 * 显示当前市场热门行业、概念板块、热门个股、昨日热门和个股资金。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-17 - 添加实时数据获取功能
 * 更新: 2025-03-20 - 优化布局，添加热门个股、昨日热门和个股资金数据
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Space, Spin, Alert, Row, Col } from 'antd';
import { FireOutlined, RiseOutlined, FallOutlined, StockOutlined, HistoryOutlined, FundOutlined } from '@ant-design/icons';
import { getHotIndustries, getConceptSectors } from '../services/marketDataService';

const { Title, Text } = Typography;

/**
 * 市场热点组件
 * @returns {JSX.Element} 市场热点组件
 */
const MarketHotspot = () => {
  // 状态管理
  const [hotIndustries, setHotIndustries] = useState([]);
  const [hotConcepts, setHotConcepts] = useState([]);
  const [hotStocks, setHotStocks] = useState([]);
  const [yesterdayHotStocks, setYesterdayHotStocks] = useState([]);
  const [stockFunds, setStockFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取实时数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 并行获取热门行业和概念板块数据
        const [industriesData, conceptsData] = await Promise.all([
          getHotIndustries(),
          getConceptSectors()
        ]);
        
        setHotIndustries(industriesData);
        setHotConcepts(conceptsData);
        setError(null);
      } catch (err) {
        console.error('获取市场热点数据失败:', err);
        setError('获取市场热点数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 设置定时刷新（每5分钟刷新一次）
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);

  // 根据涨跌幅返回不同颜色
  const getChangeColor = (change) => {
    return change.startsWith('+') ? '#cf1322' : '#3f8600';
  };

  // 根据热度返回标签颜色
  const getHotTagColor = (hot) => {
    if (hot >= 90) return 'volcano';
    if (hot >= 80) return 'orange';
    return 'gold';
  };

  // 模拟数据 - 实际项目中应通过API获取
  useEffect(() => {
    // 模拟热门个股数据
    setHotStocks([
      { name: '阿里巴巴', code: '09988', change: '+2.45%', hot: 95, volume: '3.2亿' },
      { name: '腾讯控股', code: '00700', change: '+1.78%', hot: 92, volume: '2.8亿' },
      { name: '贵州茅台', code: '600519', change: '+0.89%', hot: 88, volume: '1.5亿' },
      { name: '宁德时代', code: '300750', change: '+3.21%', hot: 86, volume: '2.1亿' },
      { name: '比亚迪', code: '002594', change: '+2.67%', hot: 85, volume: '1.8亿' },
    ]);
    
    // 模拟昨日热门数据
    setYesterdayHotStocks([
      { name: '中国平安', code: '601318', change: '-0.75%', hot: 90, volume: '2.5亿' },
      { name: '招商银行', code: '600036', change: '+1.25%', hot: 87, volume: '1.9亿' },
      { name: '五粮液', code: '000858', change: '+0.56%', hot: 84, volume: '1.2亿' },
      { name: '美的集团', code: '000333', change: '-1.23%', hot: 82, volume: '1.6亿' },
      { name: '海康威视', code: '002415', change: '+1.45%', hot: 80, volume: '1.4亿' },
    ]);
    
    // 模拟个股资金数据
    setStockFunds([
      { name: '中国移动', code: '600941', inflow: '+5.2亿', change: '+1.87%' },
      { name: '工商银行', code: '601398', inflow: '+3.8亿', change: '+0.95%' },
      { name: '中国石油', code: '601857', inflow: '+2.9亿', change: '+1.23%' },
      { name: '中国建筑', code: '601668', inflow: '+2.5亿', change: '+0.78%' },
      { name: '中国人寿', code: '601628', inflow: '+2.1亿', change: '+1.05%' },
    ]);
  }, []);

  // 渲染加载状态
  if (loading) {
    return (
      <div className="market-hotspot">
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载市场热点数据中..." />
        </Space>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="market-hotspot">
        <Alert
          message="数据加载错误"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="market-hotspot">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 热门行业和概念板块并排显示 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card 
              title={<Title level={4}><FireOutlined style={{ color: '#ff4d4f' }} /> 热门行业</Title>}
              className="hotspot-card"
              bordered={false}
            >
              <List
                dataSource={hotIndustries}
                renderItem={(item) => (
                  <List.Item>
                    <div className="hotspot-item">
                      <Text strong>{item.name}</Text>
                      <Space>
                        <Text style={{ color: getChangeColor(item.change) }}>
                          {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                        </Text>
                        <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                        {item.leader && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            领涨: {item.leader} {item.leader_change}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={<Title level={4}><FireOutlined style={{ color: '#ff4d4f' }} /> 概念板块</Title>}
              className="hotspot-card"
              bordered={false}
            >
              <List
                dataSource={hotConcepts}
                renderItem={(item) => (
                  <List.Item>
                    <div className="hotspot-item">
                      <Text strong>{item.name}</Text>
                      <Space>
                        <Text style={{ color: getChangeColor(item.change) }}>
                          {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                        </Text>
                        <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                        {item.leader && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            领涨: {item.leader} {item.leader_change}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 热门个股、昨日热门和个股资金 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card 
              title={<Title level={4}><StockOutlined style={{ color: '#1890ff' }} /> 热门个股</Title>}
              className="hotspot-card"
              bordered={false}
            >
              <List
                dataSource={hotStocks}
                renderItem={(item) => (
                  <List.Item>
                    <div className="hotspot-item">
                      <Text strong>{item.name}</Text>
                      <Space>
                        <Text type="secondary">{item.code}</Text>
                        <Text style={{ color: getChangeColor(item.change) }}>
                          {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                        </Text>
                        <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              title={<Title level={4}><HistoryOutlined style={{ color: '#722ed1' }} /> 昨日热门</Title>}
              className="hotspot-card"
              bordered={false}
            >
              <List
                dataSource={yesterdayHotStocks}
                renderItem={(item) => (
                  <List.Item>
                    <div className="hotspot-item">
                      <Text strong>{item.name}</Text>
                      <Space>
                        <Text type="secondary">{item.code}</Text>
                        <Text style={{ color: getChangeColor(item.change) }}>
                          {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                        </Text>
                        <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              title={<Title level={4}><FundOutlined style={{ color: '#52c41a' }} /> 个股资金</Title>}
              className="hotspot-card"
              bordered={false}
            >
              <List
                dataSource={stockFunds}
                renderItem={(item) => (
                  <List.Item>
                    <div className="hotspot-item">
                      <Text strong>{item.name}</Text>
                      <Space>
                        <Text type="secondary">{item.code}</Text>
                        <Text style={{ color: '#1890ff' }}>
                          流入: {item.inflow}
                        </Text>
                        <Text style={{ color: getChangeColor(item.change) }}>
                          {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                        </Text>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default MarketHotspot;