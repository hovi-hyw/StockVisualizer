// frontend/src/components/MarketHotspot.js
/**
 * 此组件用于展示市场热点板块。
 * 显示当前市场热门行业和概念板块。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-17 - 添加实时数据获取功能
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Space, Spin, Alert } from 'antd';
import { FireOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
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
      </Space>
    </div>
  );
};

export default MarketHotspot;