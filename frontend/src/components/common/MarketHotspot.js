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
import { Card, List, Tag, Typography, Space, Spin, Alert, Row, Col, Tooltip, Modal } from 'antd';
import { FireOutlined, RiseOutlined, FallOutlined, StockOutlined, HistoryOutlined, FundOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
  
  // 数据说明提示内容
  const getTooltipContent = (type) => {
    switch(type) {
      case '热门行业':
        return '数据来源：通过市场交易量和涨跌幅分析得出的行业热度排名。\n\n数据意义：反映当前市场中投资者关注度较高、交易活跃的行业板块，可用于把握市场热点和资金流向。\n\n热度指标：基于该行业成交量、换手率和涨跌幅综合计算，数值越高表示关注度越高。';
      case '概念板块':
        return '数据来源：基于市场交易数据和相关概念股票的表现分析。\n\n数据意义：展示当前市场中热门的投资概念和主题，反映市场情绪和投资偏好。\n\n热度指标：根据概念相关股票的平均涨跌幅、成交量变化等因素计算，数值越高表示该概念越受关注。';
      case '热门个股':
        return '数据来源：根据当日交易量、涨跌幅和资金流向等实时数据分析。\n\n数据意义：展示当前交易日中最受投资者关注、交易最活跃的个股，可用于把握市场热点。\n\n热度指标：综合考虑成交量、换手率、价格波动等因素，数值越高表示关注度越高。';
      case '昨日热门':
        return '数据来源：基于前一交易日的市场交易数据统计分析。\n\n数据意义：展示前一交易日中表现活跃的个股，帮助投资者了解近期市场热点变化趋势。\n\n热度指标：根据前一交易日的成交量、涨跌幅等因素计算，数值越高表示昨日关注度越高。';
      case '个股资金':
        return '数据来源：基于市场交易数据中的资金流向分析。\n\n数据意义：展示当前市场中资金净流入较多的个股，反映主力资金动向和市场情绪。\n\n资金流入指标：表示当日净流入资金规模，正值表示资金净流入，负值表示资金净流出。';
      default:
        return '';
    }
  };

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
    // 保持涨跌颜色一致，不受主题影响
    return change.startsWith('+') ? '#cf1322' : '#3f8600';
  };

  // 根据热度返回标签颜色
  const getHotTagColor = (hot) => {
    // 保持热度标签颜色一致，不受主题影响
    if (hot >= 90) return 'volcano';
    if (hot >= 80) return 'orange';
    return 'gold';
  };



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
              title={
                <Space>
                  <Title level={4}><FireOutlined style={{ color: '#ff4d4f' }} /> 热门行业</Title>
                  <Tooltip 
                    title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>{getTooltipContent('热门行业')}</Typography.Paragraph>}
                    placement="topRight"
                    overlayStyle={{ maxWidth: '300px' }}
                  >
                    <QuestionCircleOutlined className="info-icon" />
                  </Tooltip>
                </Space>
              }
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
              title={
                <Space>
                  <Title level={4}><FireOutlined style={{ color: '#ff4d4f' }} /> 概念板块</Title>
                  <Tooltip 
                    title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>{getTooltipContent('概念板块')}</Typography.Paragraph>}
                    placement="topRight"
                    overlayStyle={{ maxWidth: '300px' }}
                  >
                    <QuestionCircleOutlined className="info-icon" />
                  </Tooltip>
                </Space>
              }
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
              title={
                <Space>
                  <Title level={4}><StockOutlined style={{ color: '#1890ff' }} /> 热门个股</Title>
                  <Tooltip 
                    title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>{getTooltipContent('热门个股')}</Typography.Paragraph>}
                    placement="topRight"
                    overlayStyle={{ maxWidth: '300px' }}
                  >
                    <QuestionCircleOutlined className="info-icon" />
                  </Tooltip>
                </Space>
              }
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
              title={
                <Space>
                  <Title level={4}><HistoryOutlined style={{ color: '#722ed1' }} /> 昨日热门</Title>
                  <Tooltip 
                    title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>{getTooltipContent('昨日热门')}</Typography.Paragraph>}
                    placement="topRight"
                    overlayStyle={{ maxWidth: '300px' }}
                  >
                    <QuestionCircleOutlined className="info-icon" />
                  </Tooltip>
                </Space>
              }
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
              title={
                <Space>
                  <Title level={4}><FundOutlined style={{ color: '#52c41a' }} /> 个股资金</Title>
                  <Tooltip 
                    title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>{getTooltipContent('个股资金')}</Typography.Paragraph>}
                    placement="topRight"
                    overlayStyle={{ maxWidth: '300px' }}
                  >
                    <QuestionCircleOutlined className="info-icon" />
                  </Tooltip>
                </Space>
              }
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