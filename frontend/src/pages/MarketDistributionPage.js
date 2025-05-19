// frontend/src/pages/MarketDistributionPage.js
/**
 * 股票市场分布页面组件
 * 展示不同市场的股票涨跌分布和累计实际变化
 * Authors: hovi.hyw & AI
 * Date: 2025-04-10
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Spin, message, Row, Col } from 'antd';
import { Line, Column } from '@ant-design/plots';
import { getMarketDistribution, getIndexRealChange } from '../services/marketDistributionService';

const { Title } = Typography;
const { TabPane } = Tabs;

/**
 * 股票市场分布页面组件
 * @returns {JSX.Element} 股票市场分布页面组件
 */
const MarketDistributionPage = () => {
  // 市场代码和名称映射
  const markets = [
    { symbol: '899050', name: '北证板' },
    { symbol: '000698', name: '科创板' },
    { symbol: '399006', name: '创业板' },
    { symbol: '000001', name: 'A股所有个股' },
  ];

  // 状态定义
  const [activeMarket, setActiveMarket] = useState(markets[0].symbol);
  const [distributionData, setDistributionData] = useState([]);
  const [realChangeData, setRealChangeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取市场分布数据和实际变化数据
  const fetchData = async (symbol) => {
    try {
      setLoading(true);
      // 并行获取市场分布数据和实际变化数据
      const [distribution, realChangeResponse] = await Promise.all([
        getMarketDistribution(symbol),
        getIndexRealChange(symbol)
      ]);
      
      setDistributionData(distribution);
      
      // 计算累计实际变化
      const cumulativeData = [];
      let cumulative = 0;
      
      // 处理后端返回的数据格式
      // 后端返回格式为 {symbol: string, data: Array}
      const realChangeData = realChangeResponse.data || [];
      
      realChangeData.forEach((item) => {
        cumulative += parseFloat(item.real_change);
        cumulativeData.push({
          date: item.date,
          value: cumulative.toFixed(2)
        });
      });
      
      setRealChangeData(cumulativeData);
      setError(null);
    } catch (err) {
      console.error('获取市场分布数据失败:', err);
      setError('获取市场分布数据失败，请稍后再试');
      message.error('获取市场分布数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理市场切换
  const handleMarketChange = (symbol) => {
    setActiveMarket(symbol);
    fetchData(symbol);
  };

  // 初始加载数据
  useEffect(() => {
    fetchData(activeMarket);
  }, []);

  // 准备柱状图数据
  const prepareDistributionData = () => {
    if (!distributionData || distributionData.length === 0) return [];
    
    const result = [];
    
    distributionData.forEach((item) => {
      // 添加小于-8%的数据
      result.push({
        date: item.date,
        type: '小于-8%',
        value: parseFloat(item.count_lt_neg8pct),
        color: '#006400' // 深绿
      });
      
      // 添加-8%到-5%的数据
      result.push({
        date: item.date,
        type: '-8%到-5%',
        value: parseFloat(item.count_neg8pct_to_neg5pct),
        color: '#2e8b57' // 中绿
      });
      
      // 添加-5%到-2%的数据
      result.push({
        date: item.date,
        type: '-5%到-2%',
        value: parseFloat(item.count_neg5pct_to_neg2pct),
        color: '#90ee90' // 浅绿
      });
      
      // 添加-2%到2%的数据
      result.push({
        date: item.date,
        type: '-2%到2%',
        value: parseFloat(item.count_neg2pct_to_2pct),
        color: '#000000' // 黑色
      });
      
      // 添加2%到5%的数据
      result.push({
        date: item.date,
        type: '2%到5%',
        value: parseFloat(item.count_2pct_to_5pct),
        color: '#ffcccb' // 浅红
      });
      
      // 添加5%到8%的数据
      result.push({
        date: item.date,
        type: '5%到8%',
        value: parseFloat(item.count_5pct_to_8pct),
        color: '#cd5c5c' // 中红
      });
      
      // 添加大于8%的数据
      result.push({
        date: item.date,
        type: '大于8%',
        value: parseFloat(item.count_gt_8pct),
        color: '#8b0000' // 深红
      });
    });
    
    return result;
  };

  // 柱状图配置
  const distributionConfig = {
    data: prepareDistributionData(),
    isStack: true,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    color: ({ type }) => {
      switch (type) {
        case '小于-8%': return '#006400'; // 深绿
        case '-8%到-5%': return '#2e8b57'; // 中绿
        case '-5%到-2%': return '#90ee90'; // 浅绿
        case '-2%到2%': return '#000000'; // 黑色
        case '2%到5%': return '#ffcccb'; // 浅红
        case '5%到8%': return '#cd5c5c'; // 中红
        case '大于8%': return '#8b0000'; // 深红
        default: return '#1890ff';
      }
    },
    legend: {
      position: 'top',
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.type, value: (datum.value * 100).toFixed(1) + '%' };
      },
    },
    label: {
      position: 'middle',
      content: (item) => {
        if (item.value > 0.05) { // 只显示占比大于5%的标签
          return (item.value * 100).toFixed(0) + '%';
        }
        return '';
      },
      style: {
        fill: '#fff',
        fontSize: 12,
      },
    },
  };

  // 折线图配置
  const lineConfig = {
    data: realChangeData,
    xField: 'date',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    tooltip: {
      formatter: (datum) => {
        return { name: '累计变化', value: datum.value + '%' };
      },
    },
    annotations: [
      {
        type: 'line',
        start: ['min', '0'],
        end: ['max', '0'],
        style: {
          stroke: '#888',
          lineDash: [2, 2],
        },
      },
    ],
  };

  const getMarketName = (symbol) => {
    const market = markets.find(m => m.symbol === symbol);
    return market ? market.name : '';
  };

  return (
    <div className="market-distribution-page">
      <div className="page-header">
        <Title level={2}>股票市场分布</Title>
        <p>查看不同市场的股票涨跌分布和累计实际变化</p>
      </div>

      <Card bordered={false} className="market-distribution-card">
        <Tabs 
          activeKey={activeMarket} 
          onChange={handleMarketChange}
          type="card"
          size="large"
        >
          {markets.map(market => (
            <TabPane tab={market.name} key={market.symbol}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin tip="加载数据中..." />
                </div>
              ) : error ? (
                <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                  {error}
                </div>
              ) : (
                <div>
                  <Row gutter={[0, 24]}>
                    <Col span={24}>
                      <Title level={4}>{getMarketName(activeMarket)}累计实际变化</Title>
                      <div style={{ height: '300px' }}>
                        <Line {...lineConfig} />
                      </div>
                    </Col>
                    <Col span={24}>
                      <Title level={4}>{getMarketName(activeMarket)}涨跌分布</Title>
                      <div style={{ height: '300px' }}>
                        <Column {...distributionConfig} />
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default MarketDistributionPage;