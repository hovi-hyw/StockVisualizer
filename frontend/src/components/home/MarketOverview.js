// frontend/src/components/MarketOverview.js
/**
 * 市场概览组件
 * 展示主要市场指数数据
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 */

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { getMarketIndices } from '../../services/marketService';

/**
 * 市场概览组件
 * @returns {JSX.Element} 市场概览组件
 */
const MarketOverview = () => {
  // 市场指数数据状态
  const [marketIndices, setMarketIndices] = useState({
    '000001': { name: '上证指数', current: 0, change_percent: 0 },
    '399001': { name: '深证成指', current: 0, change_percent: 0 },
    '399006': { name: '创业板指', current: 0, change_percent: 0 },
    '000688': { name: '科创50', current: 0, change_percent: 0 },
    '000300': { name: '沪深300', current: 0, change_percent: 0 },
    '399005': { name: '中小板指', current: 0, change_percent: 0 },
    'HSCEI': { name: '恒生互联', current: 0, change_percent: 0 },
    'HSTECH': { name: '中概互联', current: 0, change_percent: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="market-overview-section">
      {error && <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>}
      <Row gutter={[24, 24]}>
        {Object.entries(marketIndices).map(([code, data]) => (
          <Col xs={24} sm={12} md={6} key={code}>
            <Card>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : (
                <Statistic 
                  title={data?.name} 
                  value={data?.current || 0} 
                  precision={2}
                  valueStyle={{ 
                    color: data?.change_percent >= 0 ? '#cf1322' : '#3f8600' 
                  }}
                  prefix={data?.change_percent >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  suffix={`${data?.change_percent >= 0 ? '+' : ''}${data?.change_percent.toFixed(2)}%`}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MarketOverview;