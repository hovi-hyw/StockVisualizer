// frontend/src/components/MarketHotspot.js
/**
 * 此组件用于展示市场热点板块。
 * 显示当前市场热门行业和概念板块。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Card, List, Tag, Typography, Space } from 'antd';
import { FireOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 市场热点组件
 * @returns {JSX.Element} 市场热点组件
 */
const MarketHotspot = () => {
  // 模拟数据 - 实际应用中应从API获取
  const hotIndustries = [
    { name: '新能源', change: '+3.25%', hot: 95 },
    { name: '半导体', change: '+2.87%', hot: 92 },
    { name: '人工智能', change: '+2.56%', hot: 90 },
    { name: '医药生物', change: '+1.78%', hot: 85 },
    { name: '消费电子', change: '+1.45%', hot: 82 },
  ];

  const hotConcepts = [
    { name: '光伏设备', change: '+4.12%', hot: 98 },
    { name: '储能技术', change: '+3.65%', hot: 94 },
    { name: '芯片国产化', change: '+3.21%', hot: 93 },
    { name: '智能驾驶', change: '+2.35%', hot: 88 },
    { name: '元宇宙', change: '-0.87%', hot: 80 },
  ];

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