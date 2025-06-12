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
    
    indicators.forEach(indicator => {
      const field = indicator.field;
      cumulativeData[field] = [];
      dailyData[field] = [];
      
      let cumulative = 0;
      fundFlowData.data.forEach(item => {
        const dailyValue = item[field] / 1_000_000; // 将元转换为百万元
        dailyData[field].push(dailyValue);
        
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
    // 每个指标单独一个柱状图
    const barSeries = [];
    selectedIndicators.forEach((key, index) => {
      const indicator = indicators.find(ind => ind.key === key);
      if (indicator) {
        barSeries.push({
          name: `${indicator.label}当日`,
          type: 'bar',
          xAxisIndex: index + 1, // 对应各自的x轴
          yAxisIndex: index + 1, // 对应各自的y轴
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
    
    // 动态计算grid配置
    // 第一个grid是价格和累计净额的折线图
    // 后面的grid是各个指标的当日资金流柱状图
    const grids = [
      {
        left: '3%',
        right: '4%',
        top: '15%',
        height: '40%',
        containLabel: true
      }
    ];
    
    // 为每个选中的指标添加一个grid
    const selectedCount = selectedIndicators.length;
    
    // 根据选中的指标数量调整布局
    let topChartHeight, barHeightValue, barSpacing, startPosition;
    
    if (selectedCount === 5) {
      // 当显示全部5个指标时的特殊配置
      topChartHeight = '25%';  // 减小顶部图表高度
      barHeightValue = 12;     // 固定每个柱状图高度
      barSpacing = 2;          // 柱状图间距
      startPosition = 35;      // 第一个柱状图起始位置
    } else if (selectedCount >= 3) {
      // 3-4个指标时的配置
      topChartHeight = '30%';
      barHeightValue = Math.max(12, Math.min(15, 60 / selectedCount));
      barSpacing = 2;
      startPosition = 40;
    } else {
      // 1-2个指标时的配置
      topChartHeight = '35%';
      barHeightValue = Math.max(15, Math.min(20, 60 / selectedCount));
      barSpacing = 3;
      startPosition = 45;
    }
    
    // 设置顶部图表高度
    grids[0].height = topChartHeight;
    
    // 计算底部留白，确保最后一个图表不会超出可视区域
    // 为dataZoom控件预留足够空间
    const bottomSpace = Math.max(8, 15 - selectedCount * 1.5);
    
    // 为每个选中的指标添加一个grid
    selectedIndicators.forEach((_, index) => {
      // 计算每个柱状图的位置
      const topPercentage = startPosition + (index * (barHeightValue + barSpacing));
      grids.push({
        left: '3%',
        right: '4%',
        top: `${topPercentage}%`,
        height: `${barHeightValue}%`,
        containLabel: true
      });
    });
    
    // 动态生成x轴配置
    const xAxes = [
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
      }
    ];
    
    // 为每个选中的指标添加一个x轴
    selectedIndicators.forEach((_, index) => {
      xAxes.push({
        type: 'category',
        data: dates,
        boundaryGap: true,
        axisLine: { onZero: false },
        // 只在最后一个图表显示完整的x轴标签
        axisLabel: {
          show: index === selectedIndicators.length - 1,
          formatter: function(value) {
            return value.substring(5); // 只显示月-日
          }
        },
        gridIndex: index + 1
      });
    });
    
    // 动态生成y轴配置
    const yAxes = [
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
      }
    ];
    
    // 为每个选中的指标添加一个y轴
    selectedIndicators.forEach((key, index) => {
      const indicator = indicators.find(ind => ind.key === key);
      yAxes.push({
        type: 'value',
        scale: true,
        splitLine: {
          show: true
        },
        axisLabel: {
          formatter: '{value}'
        },
        gridIndex: index + 1,
        name: indicator.label,
        nameLocation: 'end',
        nameGap: 10,
        nameTextStyle: {
          color: indicator.color,
          fontSize: 12
        }
      });
    });
    
    // 创建xAxisIndex数组，包含所有x轴的索引
    const xAxisIndices = Array.from({ length: selectedIndicators.length + 1 }, (_, i) => i);
    
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
          // 获取当前日期
          const date = params[0].axisValueLabel;
          let result = date + '<br/>';
          
          // 判断是折线图还是柱状图的tooltip
          // 如果包含收盘价系列，则是折线图tooltip
          const isPriceChart = params.some(item => item.seriesName === '收盘价');
          
          if (isPriceChart) {
            // 折线图tooltip：显示收盘价、涨跌幅和累计金额
            // 首先添加收盘价
            const priceItem = params.find(item => item.seriesName === '收盘价');
            if (priceItem) {
              const priceValue = priceItem.value;
              result += `${priceItem.marker} ${priceItem.seriesName}: ${priceValue.toFixed(2)}<br/>`;
              
              // 计算涨跌幅（如果有前一天数据）
              const dataIndex = priceItem.dataIndex;
              if (dataIndex > 0) {
                const prevPrice = closePrices[dataIndex - 1];
                const changePercent = ((priceValue - prevPrice) / prevPrice * 100).toFixed(2);
                const changeColor = changePercent >= 0 ? 'red' : 'green';
                result += `<span style="color:${changeColor}">涨跌幅: ${changePercent}%</span><br/>`;
              }
            }
            
            // 然后添加选中的资金流指标的累计净额
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
          } else {
            // 柱状图tooltip：只显示当日金额
            params.forEach(param => {
              if (param.seriesName.includes('当日')) {
                const value = param.value;
                const color = value >= 0 ? 'red' : 'green';
                const prefix = value >= 0 ? '+' : '';
                result += `${param.marker} <span style="color:${color}">${param.seriesName}净额: ${prefix}${value.toFixed(2)}百万</span><br/>`;
              }
            });
          }
          
          return result;
        }
      },
      legend: {
        data: ['收盘价', ...selectedIndicators.map(key => indicators.find(ind => ind.key === key).label)],
        top: 30
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: xAxisIndices, // 同时控制所有图表
          start: 0,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          xAxisIndex: xAxisIndices, // 同时控制所有图表
          // 根据选中的指标数量动态调整底部位置
          bottom: `${bottomSpace}%`,
          start: 0,
          end: 100
        }
      ],
      series: [...series, ...barSeries]
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
              style={{ 
                width: '100%', 
                // 进一步增加整个图表组件的高度，确保所有柱状图都能完整显示
                height: selectedIndicators.length === 5 ? '1500px' : 
                       selectedIndicators.length >= 3 ? '1200px' : '1000px' 
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              注：顶部图表中资金流数据为累计净额（单位：百万元），已按比例缩放以便与价格对比；下方各图表为各类资金当日流向金额（单位：百万元），红色为净流入，绿色为净流出
            </div>
          </>
        )}
      </Spin>
    </Card>
  );
};

export default StockFundFlowChart;