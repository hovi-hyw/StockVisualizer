// frontend/src/components/stock/StockFundFlowChart.js

import React, { useEffect, useState, useRef } from 'react';
import { Card, Checkbox, Row, Col, Spin, Empty, message } from 'antd';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { LineChart, BarChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import stockService from '../../services/stockService';
import { useTheme } from '../../contexts/ThemeContext';

// 注册必须的组件
echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  LineChart,
  BarChart,
  CanvasRenderer,
  UniversalTransition
]);

/**
 * 个股资金流图表组件
 * 展示个股资金流数据与收盘价的对比图表
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.symbol - 股票代码
 * @param {string} props.name - 股票名称
 */
const StockFundFlowChart = ({ symbol, name }) => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundFlowData, setFundFlowData] = useState(null);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();
  
  // 选中的资金流指标
  const [selectedIndicators, setSelectedIndicators] = useState(['main']);
  
  // 资金流指标配置
  const indicators = [
    { key: 'main', label: '主力', field: 'main_net_inflow', color: '#FF5722' },
    { key: 'super_large', label: '超大单', field: 'super_large_net_inflow', color: '#E91E63' },
    { key: 'large', label: '大单', field: 'large_net_inflow', color: '#9C27B0' },
    { key: 'medium', label: '中单', field: 'medium_net_inflow', color: '#3F51B5' },
    { key: 'small', label: '小单', field: 'small_net_inflow', color: '#2196F3' }
  ];

  // 获取个股资金流数据
  useEffect(() => {
    const fetchFundFlowData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await stockService.getStockFundFlow(symbol);
        setFundFlowData(response);
      } catch (err) {
        console.error('获取个股资金流数据失败:', err);
        setError('获取个股资金流数据失败，请稍后重试');
        message.error('获取个股资金流数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFundFlowData();
  }, [symbol]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;
    
    const newChart = echarts.init(chartRef.current, isDarkMode ? 'dark' : null);
    setChart(newChart);
    
    // 窗口大小改变时，重新调整图表大小
    const handleResize = () => {
      newChart && newChart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      newChart && newChart.dispose();
    };
  }, [isDarkMode]);

  // 更新图表主题
  useEffect(() => {
    if (chart) {
      chart.dispose();
      const newChart = echarts.init(chartRef.current, isDarkMode ? 'dark' : null);
      setChart(newChart);
    }
  }, [isDarkMode]);

  // 更新图表数据
  useEffect(() => {
    if (!chart || !fundFlowData || !fundFlowData.data || fundFlowData.data.length === 0) return;
    
    // 准备数据
    const dates = fundFlowData.data.map(item => item.date);
    const closePrices = fundFlowData.data.map(item => item.close);
    
    // 计算累计净额
    const cumulativeData = {};
    // 准备当日资金流数据
    const dailyData = {};
    
    // 计算所有资金流指标当日金额的总和
    const totalDailyFlow = [];
    
    // 初始化总和数组
    for (let i = 0; i < fundFlowData.data.length; i++) {
      totalDailyFlow.push(0);
    }
    
    indicators.forEach(indicator => {
      const field = indicator.field;
      cumulativeData[field] = [];
      dailyData[field] = [];
      
      let cumulative = 0;
      fundFlowData.data.forEach((item, index) => {
        const dailyValue = item[field] / 1_000_000; // 将元转换为百万元
        dailyData[field].push(dailyValue);
        
        // 累加到总和中
        totalDailyFlow[index] += dailyValue;
        
        cumulative += dailyValue;
        cumulativeData[field].push(cumulative);
      });
    });
    
    // 计算合适的y轴比例
    const maxPrice = Math.max(...closePrices);
    const minPrice = Math.min(...closePrices);
    
    // 计算所有选中指标的最大最小值
    let maxFlow = -Infinity;
    let minFlow = Infinity;
    
    selectedIndicators.forEach(key => {
      const indicator = indicators.find(ind => ind.key === key);
      if (indicator) {
        const field = indicator.field;
        const max = Math.max(...cumulativeData[field]);
        const min = Math.min(...cumulativeData[field]);
        
        if (max > maxFlow) maxFlow = max;
        if (min < minFlow) minFlow = min;
      }
    });
    
    // 如果没有选中任何指标，使用默认值
    if (maxFlow === -Infinity) maxFlow = 0;
    if (minFlow === Infinity) minFlow = 0;
    
    // 计算价格和资金流的比例关系
    const priceRange = maxPrice - minPrice;
    const flowRange = maxFlow - minFlow;
    
    // 避免除以零
    const ratio = flowRange === 0 ? 1 : priceRange / flowRange;
    
    // 准备系列数据
    const series = [
      {
        name: '收盘价',
        type: 'line',
        data: closePrices,
        xAxisIndex: 0,
        yAxisIndex: 0,
        symbol: 'none',
        lineStyle: {
          width: 2
        },
        emphasis: {
          focus: 'series'
        }
      }
    ];
    
    // 添加选中的资金流指标系列
    selectedIndicators.forEach(key => {
      const indicator = indicators.find(ind => ind.key === key);
      if (indicator) {
        series.push({
          name: indicator.label,
          type: 'line',
          data: cumulativeData[indicator.field].map(value => {
            // 将资金流数据按比例缩放，使其与价格在同一数量级
            return minPrice + (value - minFlow) * ratio;
          }),
          xAxisIndex: 0,
          yAxisIndex: 0,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: indicator.color,
            type: 'dashed' // 将资金流线条改为虚线
          },
          emphasis: {
            focus: 'series'
          }
        });
      }
    });
    
    // 准备柱状图数据系列（当日资金流）
    const barSeries = [];
    selectedIndicators.forEach(key => {
      const indicator = indicators.find(ind => ind.key === key);
      if (indicator) {
        barSeries.push({
          name: `${indicator.label}当日`,
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: dailyData[indicator.field].map(value => value),
          itemStyle: {
            // 根据正负值设置颜色
            color: params => {
              return params.value >= 0 ? '#ff5555' : '#55aa7f';
            }
          }
        });
      }
    });
    
    // 添加资金流总和柱状图
    const totalFlowSeries = {
      name: '资金流向总和',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: totalDailyFlow,
      itemStyle: {
        // 根据正负值设置颜色
        color: params => {
          return params.value >= 0 ? '#ff5555' : '#55aa7f';
        }
      }
    };
    
    // 设置图表选项
    const option = {
      title: {
        text: `${name || symbol} 资金流向与价格对比`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function(params) {
          let result = params[0].axisValueLabel + '<br/>';
          
          // 判断是哪个图表的tooltip
          const isPriceChart = params.some(item => item.seriesName === '收盘价');
          const isTotalFlowChart = params.some(item => item.seriesName === '资金流向总和');
          const isDetailFlowChart = !isPriceChart && !isTotalFlowChart;
          
          if (isPriceChart) {
            // 收盘价折线图tooltip
            // 添加收盘价
            const priceItem = params.find(item => item.seriesName === '收盘价');
            if (priceItem) {
              result += `${priceItem.marker} ${priceItem.seriesName}: ${priceItem.value.toFixed(2)}<br/>`;
            }
            
            // 添加资金流指标的累计净额
            params.forEach(param => {
              if (param.seriesName !== '收盘价' && !param.seriesName.includes('当日')) {
                const indicator = indicators.find(ind => ind.label === param.seriesName);
                if (indicator) {
                  const index = param.dataIndex;
                  const originalValue = cumulativeData[indicator.field][index];
                  result += `${param.marker} ${param.seriesName}累计净额: ${originalValue.toFixed(2)}百万<br/>`;
                }
              }
            });
          } else if (isTotalFlowChart) {
            // 资金流向总和柱状图tooltip
            const totalFlowItem = params.find(item => item.seriesName === '资金流向总和');
            if (totalFlowItem) {
              const value = totalFlowItem.value;
              const color = value >= 0 ? 'red' : 'green';
              const prefix = value >= 0 ? '+' : '';
              result += `${totalFlowItem.marker} <span style="color:${color}">${totalFlowItem.seriesName}: ${prefix}${value.toFixed(2)}百万</span><br/>`;
              
              // 添加涨跌幅
              const dataIndex = totalFlowItem.dataIndex;
              if (dataIndex > 0) {
                const currentPrice = closePrices[dataIndex];
                const prevPrice = closePrices[dataIndex - 1];
                const changePercent = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);
                const changeColor = changePercent >= 0 ? 'red' : 'green';
                result += `<span style="color:${changeColor}">涨跌幅: ${changePercent}%</span><br/>`;
              }
            }
          } else if (isDetailFlowChart) {
            // 各指标当日资金流柱状图tooltip
            params.forEach(param => {
              if (param.seriesName.includes('当日')) {
                const value = param.value;
                const color = value >= 0 ? 'red' : 'green';
                const prefix = value >= 0 ? '+' : '';
                result += `${param.marker} <span style="color:${color}">${param.seriesName}: ${prefix}${value.toFixed(2)}百万</span><br/>`;
              }
            });
            
            // 添加涨跌幅
            const dataIndex = params[0].dataIndex;
            if (dataIndex > 0) {
              const currentPrice = closePrices[dataIndex];
              const prevPrice = closePrices[dataIndex - 1];
              const changePercent = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);
              const changeColor = changePercent >= 0 ? 'red' : 'green';
              result += `<span style="color:${changeColor}">涨跌幅: ${changePercent}%</span><br/>`;
            }
          }
          
          return result;
        }
      },
      legend: {
        data: ['收盘价', '资金流向总和', ...selectedIndicators.map(key => indicators.find(ind => ind.key === key).label)],
        top: 30
      },
      grid: [
        {
          left: '3%',
          right: '4%',
          top: '15%',
          height: '45%', // 增加收盘价折线图高度50%
          containLabel: true
        },
        {
          left: '3%',
          right: '4%',
          top: '65%',
          height: '15%',
          containLabel: true
        },
        {
          left: '3%',
          right: '4%',
          top: '85%',
          height: '10%',
          containLabel: true
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisLabel: {
            formatter: function(value) {
              return value.substring(5); // 只显示月-日
            }
          },
          gridIndex: 0
        },
        {
          type: 'category',
          data: dates,
          boundaryGap: true,
          axisLine: { onZero: false },
          axisLabel: {
            formatter: function(value) {
              return value.substring(5); // 只显示月-日
            }
          },
          gridIndex: 1
        },
        {
          type: 'category',
          data: dates,
          boundaryGap: true,
          axisLine: { onZero: false },
          axisLabel: {
            formatter: function(value) {
              return value.substring(5); // 只显示月-日
            }
          },
          gridIndex: 2
        }
      ],
      yAxis: [
        {
          type: 'value',
          scale: true,
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value}'
          },
          gridIndex: 0
        },
        {
          type: 'value',
          scale: true,
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value}百万'
          },
          gridIndex: 1,
          name: '资金流向总和',
          nameLocation: 'end',
          nameGap: 10,
          nameTextStyle: {
            fontSize: 12
          }
        },
        {
          type: 'value',
          scale: true,
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value}百万'
          },
          gridIndex: 2
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1, 2], // 同时控制三个图表
          start: 0,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          xAxisIndex: [0, 1, 2], // 同时控制三个图表
          bottom: '2%',
          start: 0,
          end: 100
        }
      ],
      series: [...series, totalFlowSeries, ...barSeries]
    };
    
    chart.setOption(option, true);
  }, [chart, fundFlowData, selectedIndicators, name, symbol]);

  // 处理指标选择变化
  const handleIndicatorChange = (checkedValues) => {
    // 至少选择一个指标
    if (checkedValues.length === 0) {
      message.warning('请至少选择一个资金流指标');
      return;
    }
    setSelectedIndicators(checkedValues);
  };

  return (
    <Card title="个股资金流向" className="chart-card">
      <Spin spinning={loading}>
        {error ? (
          <Empty description={error} />
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col span={24}>
                <Checkbox.Group
                  options={indicators.map(item => ({ label: item.label, value: item.key }))}
                  value={selectedIndicators}
                  onChange={handleIndicatorChange}
                />
              </Col>
            </Row>
            <div
              ref={chartRef}
              style={{ width: '100%', height: '750px' }} // 增加图表容器高度
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              注：顶部图表中资金流数据为累计净额（单位：百万元），已按比例缩放以便与价格对比；中间图表为当日资金流总和（单位：百万元）；底部图表为各类资金当日流向金额（单位：百万元），红色为净流入，绿色为净流出
            </div>
          </>
        )}
      </Spin>
    </Card>
  );
};

export default StockFundFlowChart;