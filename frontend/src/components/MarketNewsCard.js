// frontend/src/components/MarketNewsCard.js
/**
 * 此组件用于展示市场资讯。
 * 显示当前市场最新资讯。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-17
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Alert } from 'antd';
import { getMarketNews } from '../services/marketDataService';

const { Title, Text } = Typography;

/**
 * 市场资讯卡片组件
 * @returns {JSX.Element} 市场资讯卡片组件
 */
const MarketNewsCard = () => {
  // 状态管理
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取实时数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMarketNews();
        setNewsData(data);
        setError(null);
      } catch (err) {
        console.error('获取市场资讯数据失败:', err);
        setError('获取市场资讯数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 设置定时刷新（每10分钟刷新一次）
    const intervalId = setInterval(fetchData, 10 * 60 * 1000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);

  // 渲染加载状态
  if (loading) {
    return (
      <Card
        title={<Title level={4}>市场资讯</Title>}
        className="news-card"
        bordered={false}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载市场资讯数据中..." />
        </div>
      </Card>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Card
        title={<Title level={4}>市场资讯</Title>}
        className="news-card"
        bordered={false}
      >
        <Alert
          message="数据加载错误"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={4}>市场资讯</Title>}
      className="news-card"
      bordered={false}
    >
      <List
        itemLayout="horizontal"
        dataSource={newsData}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>}
              description={
                <div>
                  <Text type="secondary">{item.date}</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{item.summary}</Text>
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>来源: {item.source}</Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MarketNewsCard;