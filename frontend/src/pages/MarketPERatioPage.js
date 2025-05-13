// frontend/src/pages/MarketPERatioPage.js
/**
 * 全市场市盈率走势页面组件
 * 展示上证、深证、创业板、科创版四个市场的市盈率走势和K线图对比
 * Authors: hovi.hyw & AI
 * Date: 2025-03-28
 */

import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert, Radio, Space, Tabs, Row, Col } from 'antd';
import { LineChartOutlined, AreaChartOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getAllMarketPERatios, getAllMarketKLineData } from '../services/peRatioService';

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
  const [chartType, setChartType] = useState('combined'); // 'combined', 'pe', 'kline'
  // 默认显示所有市场，不再提供选择
  const selectedMarkets = ['上证', '深证', '创业板', '科创版'];
  
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
        
        setPERatioData(peRatios);
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

  // 不再需要市场选择变更处理函数

  // 处理图表类型变更
  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  // 生成组合图表选项
  const getCombinedChartOption = () => {
    // 添加数据验证
    console.log('市盈率数据:', peRatioData);
    console.log('K线数据:', klineData);
    
    // 确保数据存在
    if (!peRatioData || Object.keys(peRatioData).length === 0) {
      return { series: [] };
    }

    // 准备数据
    const series = [];
    let xAxisData = [];
    const legends = [];
    
    // 首先获取所有市场市盈率数据的日期并合并去重，作为基础时间轴
    selectedMarkets.forEach(market => {
      if (peRatioData[market] && peRatioData[market].length > 0) {
        const dates = peRatioData[market].map(item => item.date);
        xAxisData = [...xAxisData, ...dates];
      }
    });
    
    // 去重并排序日期 - 这将作为统一的时间轴
    xAxisData = [...new Set(xAxisData)].sort();
    
    // 处理选中的市场
    selectedMarkets.forEach(market => {
      if (peRatioData[market] && peRatioData[market].length > 0) {
        // 市盈率数据处理保持不变
        const peMap = {};
        peRatioData[market].forEach(item => {
          peMap[item.date] = item.pe_ratio;
        });
        
        const peData = xAxisData.map(date => peMap[date] || null);
        
        series.push({
          name: `${market}市盈率`,
          type: 'line',
          yAxisIndex: 0,
          data: peData,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2
          },
          connectNulls: true
        });
        legends.push(`${market}市盈率`);
        
        // 收盘价数据处理 - 只显示市盈率数据对应日期的收盘价
        if (klineData[market] && klineData[market].length > 0) {
          const closeMap = {};
          klineData[market].forEach(item => {
            closeMap[item.date] = item.close;
          });
          
          // 只使用市盈率数据中的日期来获取对应的收盘价
          const peDates = peRatioData[market].map(item => item.date);
          const closeData = peDates.map(date => closeMap[date] || null);
          
          series.push({
            name: `${market}收盘价`,
            type: 'line',
            yAxisIndex: 1,
            data: closeData,
            symbol: 'emptyCircle',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              type: 'dashed'
            },
            connectNulls: true
          });
          legends.push(`${market}收盘价`);
        }
      }
    });

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
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: 45
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

  // 生成市盈率图表选项
  const getPERatioChartOption = () => {
    // 如果数据未加载完成，返回空选项
    if (loading || !peRatioData || Object.keys(peRatioData).length === 0) {
      return { series: [] };
    }

    // 准备数据
    const series = [];
    let xAxisData = [];
    const legends = [];
    
    // 首先获取所有市场市盈率数据的日期并合并去重，作为基础时间轴
    selectedMarkets.forEach(market => {
      if (peRatioData[market] && peRatioData[market].length > 0) {
        const dates = peRatioData[market].map(item => item.date);
        xAxisData = [...xAxisData, ...dates];
      }
    });
    
    // 去重并排序日期 - 这将作为统一的时间轴
    xAxisData = [...new Set(xAxisData)].sort();
    
    // 处理选中的市场
    selectedMarkets.forEach(market => {
      if (peRatioData[market] && peRatioData[market].length > 0) {
        // 创建日期到市盈率的映射
        const peMap = {};
        peRatioData[market].forEach(item => {
          peMap[item.date] = item.pe_ratio;
        });
        
        // 根据统一的时间轴创建数据点
        const peData = xAxisData.map(date => peMap[date] || null);
        
        series.push({
          name: `${market}市盈率`,
          type: 'line',
          data: peData,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2
          },
          connectNulls: true
        });
        legends.push(`${market}市盈率`);
      }
    });

    return {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: legends,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '市盈率',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: series
    };
  };

  // 生成K线图表选项
  const getKLineChartOption = () => {
    // 如果数据未加载完成，返回空选项
    if (loading || !klineData || Object.keys(klineData).length === 0) {
      return { series: [] };
    }

    // 准备数据
    const series = [];
    let xAxisData = [];
    const legends = [];
    
    // 首先获取所有市场数据的日期并合并去重，确保时间轴对齐
    selectedMarkets.forEach(market => {
      if (klineData[market] && klineData[market].length > 0) {
        const dates = klineData[market].map(item => item.date);
        xAxisData = [...xAxisData, ...dates];
      }
    });
    
    // 去重并排序日期
    xAxisData = [...new Set(xAxisData)].sort();
    
    // 处理选中的市场
    selectedMarkets.forEach(market => {
      if (klineData[market] && klineData[market].length > 0) {
        // 创建日期到收盘价的映射
        const closeMap = {};
        klineData[market].forEach(item => {
          closeMap[item.date] = item.close;
        });
        
        // 根据统一的时间轴创建数据点
        const closeData = xAxisData.map(date => closeMap[date] || null);
        
        series.push({
          name: `${market}指数`,
          type: 'line',
          data: closeData,
          symbol: 'emptyCircle',
          symbolSize: 6,
          lineStyle: {
            width: 2
          },
          connectNulls: true
        });
        legends.push(`${market}指数`);
      }
    });

    return {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: legends,
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '指数点位',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: series
    };
  };

  // 获取当前图表选项
  const getChartOption = () => {
    switch (chartType) {
      case 'pe':
        return getPERatioChartOption();
      case 'kline':
        return getKLineChartOption();
      case 'combined':
      default:
        return getCombinedChartOption();
    }
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
      
      <Card bordered={false} className="chart-card" style={{ marginTop: '20px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 控制面板 */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={24}>
              <Space>
                <Text strong>图表类型：</Text>
                <Radio.Group onChange={handleChartTypeChange} value={chartType}>
                  <Radio.Button value="combined"><LineChartOutlined /> 组合图表</Radio.Button>
                  <Radio.Button value="pe"><LineChartOutlined /> 仅市盈率</Radio.Button>
                  <Radio.Button value="kline"><AreaChartOutlined /> 仅K线</Radio.Button>
                </Radio.Group>
              </Space>
            </Col>
          </Row>
          
          {/* 图表区域 */}
          <div style={{ height: '600px', width: '100%' }}>
            <ReactECharts 
              option={getChartOption()} 
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
          
          {/* 说明文字 */}
          <div className="chart-description">
            <Text type="secondary">
              <QuestionCircleOutlined /> 说明：本图表展示了四个市场（上证、深证、创业板、科创版）的市盈率走势和指数K线走势对比。
              市盈率是衡量股票估值的重要指标，通常市盈率越低，表示股票相对便宜；市盈率越高，表示股票相对昂贵。
              通过对比不同市场的市盈率和指数走势，可以更好地理解市场估值水平和投资机会。
            </Text>
          </div>
        </Space>
      </Card>
      
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