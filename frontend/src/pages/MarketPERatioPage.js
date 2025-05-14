// frontend/src/pages/MarketPERatioPage.js
/**
 * 全市场市盈率走势页面组件
 * 展示上证、深证、创业板、科创版四个市场的市盈率走势和K线图对比
 * 每个市场使用独立的卡片式图表展示
 * Authors: hovi.hyw & AI
 * Date: 2025-03-28
 * 更新: 2025-04-03 - 重构为卡片式独立图表
 */

import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert, Space, Tabs, Row, Col, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getAllMarketPERatios, getAllMarketKLineData, processMarketData } from '../services/peRatioService';

const { Title, Text } = Typography;

/**
 * 全市场市盈率走势页面组件
 * @returns {JSX.Element} 全市场市盈率走势页面组件
 */
const MarketPERatioPage = () => {
  // 状态管理
  const [peRatioData, setPERatioData] = useState({});
  const [klineData, setKlineData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 市场列表
  const markets = ['上证', '深证', '创业板', '科创版'];
  
  // 获取市盈率和K线数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 并行获取市盈率和K线数据
        const [peRatios, klines] = await Promise.all([
          getAllMarketPERatios(),
          getAllMarketKLineData()
        ]);
        
        // 处理市盈率数据，特别是科创板的数据
        const processedPERatios = processMarketData(peRatios, klines);
        
        setPERatioData(processedPERatios);
        setKlineData(klines);
        setError(null);
      } catch (err) {
        console.error('获取市场数据失败:', err);
        setError('获取市场数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 设置定时刷新（每天刷新一次）
    const intervalId = setInterval(fetchData, 24 * 60 * 60 * 1000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);

  // 生成单个市场的图表选项
  const getMarketChartOption = (market) => {
    // 确保数据存在
    if (!klineData[market] || !klineData[market].length) {
      return { series: [] };
    }
    
    // 检查市盈率数据是否存在，如果不存在则使用空数组
    const marketPEData = peRatioData[market] && peRatioData[market].length ? peRatioData[market] : [];

    // 准备数据
    const series = [];
    const legends = [];
    
    // 使用K线数据的日期作为基准，确保即使没有市盈率数据也能显示K线
    const klineDates = klineData[market].map(item => item.date).sort();
    
    // 创建市盈率数据的映射
    const peMap = {};
    const indexMap = {}; // 用于存储科创板的指数值
    marketPEData.forEach(item => {
      peMap[item.date] = item.pe_ratio;
      // 如果是科创板且有index_value字段，则使用该字段作为指数值
      if (market === "科创版" && item.index_value) {
        indexMap[item.date] = item.index_value;
      }
    });
    
    // 创建K线数据的映射
    const closeMap = {};
    klineData[market].forEach(item => {
      closeMap[item.date] = item.close;
    });
    
    // 市盈率数据 - 使用K线数据的日期
    const peData = klineDates.map(date => peMap[date] || null);
    
    // 收盘价数据 - 使用K线数据的日期
    // 如果是科创板且有对应日期的指数值，则使用指数值，否则使用K线收盘价
    const closeData = klineDates.map(date => {
      if (market === "科创版" && indexMap[date]) {
        return indexMap[date];
      }
      return closeMap[date] || null;
    });
    
    // 添加市盈率系列
    series.push({
      name: `市盈率`,
      type: 'line',
      yAxisIndex: 0,
      data: peData,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: '#5470C6'
      },
      connectNulls: true
    });
    legends.push(`市盈率`);
    
    // 添加收盘价系列
    series.push({
      name: `收盘价`,
      type: 'line',
      yAxisIndex: 1,
      data: closeData,
      symbol: 'emptyCircle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        type: 'dashed',
        color: '#91CC75'
      },
      connectNulls: true
    });
    legends.push(`收盘价`);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: legends,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%', // 增加底部空间以容纳dataZoom控件
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside', // 内置型数据区域缩放组件，支持鼠标滚轮缩放
          start: 0,
          end: 100,
          zoomOnMouseWheel: true // 启用鼠标滚轮缩放
        },
        {
          type: 'slider', // 滑动条型数据区域缩放组件
          start: 0,
          end: 100,
          height: 30,
          bottom: 0,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%'
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: klineDates,
        axisLabel: {
          rotate: 45,
          interval: Math.floor(klineDates.length / 10) // 控制标签显示密度
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '市盈率',
          position: 'left',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#5470C6'
            }
          },
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '指数点位',
          position: 'right',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#91CC75'
            }
          },
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: series
    };
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="market-pe-ratio-page">
        <div className="page-header">
          <Title level={2}>全市场市盈率走势</Title>
          <p>查看和分析上证、深证、创业板、科创版四个市场的市盈率走势和K线图对比</p>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin tip="加载市场数据中..." size="large" />
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="market-pe-ratio-page">
        <div className="page-header">
          <Title level={2}>全市场市盈率走势</Title>
          <p>查看和分析上证、深证、创业板、科创版四个市场的市盈率走势和K线图对比</p>
        </div>
        <Alert
          message="数据加载错误"
          description={error}
          type="error"
          showIcon
          style={{ margin: '20px 0' }}
        />
      </div>
    );
  }

  return (
    <div className="market-pe-ratio-page">
      <div className="page-header">
        <Title level={2}>全市场市盈率走势</Title>
        <p>查看和分析上证、深证、创业板、科创版四个市场的市盈率走势和K线图对比</p>
      </div>
      
      {/* 市场卡片区域 - 使用Collapse组件实现可折叠效果 */}
      <Collapse defaultActiveKey={[]} style={{ marginTop: '20px' }}>
        {markets.map(market => (
          <Collapse.Panel 
            key={market} 
            header={`${market}市场市盈率与指数走势`}
            className="market-chart-panel"
          >
            <div style={{ height: '500px', width: '100%' }}>
              <ReactECharts 
                option={getMarketChartOption(market)} 
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
            <div className="chart-description" style={{ marginTop: '10px' }}>
              <Text type="secondary">
                <QuestionCircleOutlined /> {market}市场市盈率与指数走势对比图，蓝线为市盈率，绿线为指数收盘价。
              </Text>
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>
      
      {/* 市场分析卡片 */}
      <Card bordered={false} className="analysis-card" style={{ marginTop: '20px' }}>
        <Tabs defaultActiveKey="analysis" size="large">
          <Tabs.TabPane tab="市场估值分析" key="analysis">
            <div className="analysis-content" style={{ padding: '20px 0' }}>
              <Title level={4}>市场估值分析</Title>
              <p>
                市盈率（Price-to-Earnings Ratio，简称P/E比率）是最常用的股票估值指标之一，它反映了投资者愿意为每1元收益支付的价格。
                市盈率越高，表示投资者对公司未来成长的预期越高；市盈率越低，可能意味着投资者对公司未来成长的预期较低，或者公司被低估。
              </p>
              <p>
                通过对比不同市场的市盈率水平，可以发现：
              </p>
              <ul>
                <li>上证市场：以大型蓝筹股为主，市盈率通常较低，波动性较小。</li>
                <li>深证市场：包含更多中小型企业，市盈率通常高于上证，波动性较大。</li>
                <li>创业板：以高成长性企业为主，市盈率通常较高，反映了投资者对高成长的预期。</li>
                <li>科创版：以科技创新企业为主，市盈率通常最高，反映了科技创新企业的高估值特性。</li>
              </ul>
              <p>
                投资者可以结合市盈率和指数走势，寻找估值相对合理且具有上涨潜力的市场进行投资。
              </p>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="历史估值区间" key="history">
            <div className="history-content" style={{ padding: '20px 0' }}>
              <Title level={4}>历史估值区间</Title>
              <p>
                不同市场的历史市盈率区间：
              </p>
              <ul>
                <li>上证市场：历史市盈率通常在10-20倍之间，超过20倍可能被视为高估，低于10倍可能被视为低估。</li>
                <li>深证市场：历史市盈率通常在15-30倍之间，波动范围较大。</li>
                <li>创业板：历史市盈率通常在30-60倍之间，反映了高成长性企业的特性。</li>
                <li>科创版：作为新兴市场，历史市盈率通常在40-80倍之间，波动性最大。</li>
              </ul>
              <p>
                投资者可以参考历史估值区间，结合当前市场环境和经济周期，判断市场的整体估值水平是否合理。
              </p>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="投资策略建议" key="strategy">
            <div className="strategy-content" style={{ padding: '20px 0' }}>
              <Title level={4}>投资策略建议</Title>
              <p>
                基于市盈率和市场走势的投资策略建议：
              </p>
              <ul>
                <li><strong>价值投资策略</strong>：关注市盈率处于历史低位的市场，寻找被低估的投资机会。</li>
                <li><strong>成长投资策略</strong>：关注市盈率合理但增长潜力大的市场，如科技创新领域。</li>
                <li><strong>均衡配置策略</strong>：根据不同市场的估值水平，进行多市场均衡配置，分散风险。</li>
                <li><strong>逆向投资策略</strong>：当某个市场市盈率处于历史极低水平且基本面未发生根本性变化时，考虑逆向投资。</li>
              </ul>
              <p>
                请注意，市盈率只是众多投资指标中的一个，投资决策应结合其他基本面和技术面指标，以及宏观经济环境综合考虑。
              </p>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MarketPERatioPage;