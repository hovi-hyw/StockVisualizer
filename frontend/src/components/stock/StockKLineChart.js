// frontend/src/components/StockKLineChart.js
/**
 * 此组件用于展示股票K线图。
 * 使用ECharts绘制股票K线图，包含K线、量能、真实涨跌和对比涨跌四个子图表。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-15 - 添加对比涨跌图表，调整图表高度为原来的80%
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { formatDate, formatLargeNumber } from '../../utils/formatters';
import { getStockRealChange } from '../../services/stockService';

/**
 * 股票K线图组件
 * @param {Object} props - 组件属性
 * @param {Array} props.data - K线数据
 * @param {string} props.title - 图表标题
 * @param {string} props.theme - 图表主题，'light'或'dark'
 * @param {string} props.symbol - 股票代码，用于获取真实涨跌数据
 */
const StockKLineChart = ({ data, title = '股票K线图', theme = 'light', symbol }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [realChangeData, setRealChangeData] = useState(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      // 根据当前主题初始化图表
      const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      chartInstance.current = echarts.init(chartRef.current, currentTheme);
      
      // 将图表添加到stockCharts组，实现联动
      echarts.connect('stockCharts');

      // 监听窗口大小变化，调整图表大小
      const resizeHandler = () => {
        chartInstance.current.resize();
      };
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
        chartInstance.current.dispose();
      };
    }
  }, []);
  
  // 监听主题变化，重新初始化图表
  useEffect(() => {
    if (chartInstance.current) {
      const currentTheme = theme === 'dark' ? 'dark' : 'light';
      // 如果当前主题与图表主题不一致，重新初始化图表
      const chartTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      if (chartTheme !== currentTheme) {
        try {
          const option = chartInstance.current.getOption();
          chartInstance.current.dispose();
          chartInstance.current = echarts.init(chartRef.current, currentTheme);
          if (option) {
            chartInstance.current.setOption(option);
          }
          echarts.connect('stockCharts');
        } catch (error) {
          console.error('重新初始化图表失败:', error);
        }
      }
    }
  }, [theme]);

  // 获取真实涨跌数据和对比涨跌数据
  useEffect(() => {
    const fetchRealChangeData = async () => {
      if (!data || !data.data || data.data.length === 0 || !symbol) return;
      
      try {
        // 获取日期范围
        const startDate = data.data[0]?.date;
        const endDate = data.data[data.data.length - 1]?.date;
        const dateParams = {
          start_date: startDate,
          end_date: endDate
        };
        
        // 获取个股真实涨跌数据
        const realChangeResponse = await getStockRealChange(symbol, dateParams);
        
        // 确保返回的数据有效
        if (realChangeResponse && realChangeResponse.data && realChangeResponse.data.length > 0) {
          console.log('成功获取股票真实涨跌数据:', realChangeResponse.data.length, '条');
          setRealChangeData(realChangeResponse);
        } else {
          console.error('获取的股票真实涨跌数据为空');
        }
      } catch (error) {
        console.error(`获取股票真实涨跌数据失败:`, error);
      }
    };

    fetchRealChangeData();
  }, [data, symbol]);

  useEffect(() => {
    if (!chartInstance.current || !data || !data.data || data.data.length === 0) return;

    const klineData = data.data;
    const dates = klineData.map(item => item.date);
    // 确保数据按日期排序
    const sortedData = [...klineData].sort((a, b) => new Date(a.date) - new Date(b.date));
    // 按照ECharts要求的顺序：[开盘价, 收盘价, 最低价, 最高价]
    const values = sortedData.map(item => [
      parseFloat(item.open),
      parseFloat(item.close),
      parseFloat(item.low),
      parseFloat(item.high)
    ]);
    const amounts = sortedData.map(item => parseFloat(item.amount) / 1000000); // 除以100万
    
    // 创建真实涨跌数据数组
    let realChangeValues = [];
    let comparativeChangeValues = [];
    let referenceNames = [];
    let referenceIndices = [];
    
    // 处理真实涨跌数据和对比涨跌数据
    if (realChangeData && realChangeData.data) {
      const realChangeDataArray = realChangeData.data;
      
      // 提取真实涨跌值
      realChangeValues = sortedData.map(item => {
        const matchingItem = realChangeDataArray.find(rcItem => rcItem.date === item.date);
        // 确保将真实涨跌值转换为数字类型并乘以100
        return matchingItem ? parseFloat(matchingItem.real_change) * 100 : 0;
      });
      
      // 提取对比涨跌值（直接从后端获取，不需要前端计算）
      comparativeChangeValues = sortedData.map(item => {
        const matchingItem = realChangeDataArray.find(rcItem => rcItem.date === item.date);
        // 确保将对比涨跌值转换为数字类型并乘以100
        return matchingItem ? parseFloat(matchingItem.comparative_change) * 100 : 0;
      });
      
      // 提取参考指数名称和代码
      referenceNames = sortedData.map(item => {
        const matchingItem = realChangeDataArray.find(rcItem => rcItem.date === item.date);
        return matchingItem ? matchingItem.reference_name || '无参考' : '无参考';
      });
      
      referenceIndices = sortedData.map(item => {
        const matchingItem = realChangeDataArray.find(rcItem => rcItem.date === item.date);
        return matchingItem ? matchingItem.reference_index || '' : '';
      });
      
      // 确保真实涨跌数据有效
      if (realChangeValues.length === 0 || realChangeValues.every(val => val === 0)) {
        console.warn('真实涨跌数据为空或全为0，请检查数据源');
      } else {
        console.log('真实涨跌数据已加载:', realChangeValues.length, '条');
        console.log('对比涨跌数据已加载:', comparativeChangeValues.length, '条');
      }
    }
    
    // 计算网格布局和坐标轴索引
    let grids = [];
    
    // 设置主K线图网格
    grids.push({
      left: '5%',
      right: '5%',
      height: '48%'
    });
    
    // 设置成交量图网格
    grids.push({
      left: '5%',
      right: '5%',
      top: '53%',
      height: '12%'
    });
    
    // 添加真实涨跌图网格
    grids.push({
      left: '5%',
      right: '5%',
      top: '70%',
      height: '12%'
    });
    
    // 添加对比涨跌图网格
    grids.push({
      left: '5%',
      right: '5%',
      top: '87%',
      height: '12%'
    });
    
    const option = {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        padding: 0,
        extraCssText: 'padding: 0;',
        formatter: function(params) {
          if (!params || !params[0] || !params[0].data) {
            return '';
          }
          const data = params[0].data;
          const index = params[0].dataIndex;
          
          // 从原始数据中获取价格信息
          const open = sortedData[index].open;
          const close = sortedData[index].close;
          const low = sortedData[index].low;
          const high = sortedData[index].high;
          const volume = sortedData[index].volume;
          
          // 获取真实涨跌数据和对比涨跌数据
          let realChange = '暂无数据';
          let comparativeChange = '暂无数据';
          let referenceName = '无参考';
          let referenceIndex = '';
          
          if (realChangeValues && realChangeValues.length > index) {
            realChange = realChangeValues[index].toFixed(2) + '%';
          }
          if (comparativeChangeValues && comparativeChangeValues.length > index) {
            const value = comparativeChangeValues[index];
            comparativeChange = !isNaN(value) ? value.toFixed(2) + '%' : '暂无数据';
          }
          if (referenceNames && referenceNames.length > index) {
            referenceName = referenceNames[index] || '无参考';
          }
          if (referenceIndices && referenceIndices.length > index) {
            referenceIndex = referenceIndices[index];
          }
          
          // 格式化参考指数显示
          const referenceText = referenceIndex ? `${referenceName}（${referenceIndex}）` : referenceName;

          // 根据当前主题设置tooltip样式
          const isDarkMode = document.body.classList.contains('dark-theme');
          const bgColor = isDarkMode ? 'rgba(31, 31, 31, 0.9)' : 'rgba(255, 255, 255, 0.9)';
          const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#333';
          
          // 构建tooltip内容
          let tooltipContent = `
            <div style="padding: 0; background-color: ${bgColor}; color: ${textColor}; border-radius: 4px;">
              <p style="margin: 0">${formatDate(params[0].axisValue)}</p>
              <p style="margin: 0">开盘: ${parseFloat(open).toFixed(2)}</p>
              <p style="margin: 0">收盘: ${parseFloat(close).toFixed(2)}</p>
              <p style="margin: 0">最低: ${parseFloat(low).toFixed(2)}</p>
              <p style="margin: 0">最高: ${parseFloat(high).toFixed(2)}</p>
              <p style="margin: 0">成交额: ${(parseFloat(sortedData[index].amount)/1000000).toFixed(2)}百万</p>
          `;
          
          tooltipContent += `<p style="margin: 0">真实涨跌: ${realChange}</p>`;
          tooltipContent += `<p style="margin: 0">对比涨跌: ${comparativeChange}</p>`;
          tooltipContent += `<p style="margin: 0">参考指数: ${referenceText}</p>`;
          
          tooltipContent += `</div>`;
          
          return tooltipContent;
        }
      },
      legend: {
        data: ['K线', '成交量'],
        left: 'right'
      },
      grid: grids,
      xAxis: [
        {
          type: 'category',
          gridIndex: 0,
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20
        },
        {
          type: 'category',
          gridIndex: 1,
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          splitNumber: 20
        },
        {
          type: 'category',
          gridIndex: 2,
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          splitNumber: 20
        },
        {
          type: 'category',
          gridIndex: 3,
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: true },
          splitNumber: 20
        }
      ],
      yAxis: [
        {
          scale: true,
          gridIndex: 0,
          splitArea: {
            show: true
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        },
        {
          scale: true,
          gridIndex: 2,
          splitNumber: 2,
          axisLabel: { 
            show: true,
            formatter: '{value}%'
          },
          axisLine: { show: true },
          axisTick: { show: true },
          splitLine: { show: false },
          name: '真实涨跌(%)',
        },
        {
          scale: true,
          gridIndex: 3,
          splitNumber: 2,
          axisLabel: { 
            show: true,
            formatter: '{value}%'
          },
          axisLine: { show: true },
          axisTick: { show: true },
          splitLine: { show: false },
          name: '对比涨跌',
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1, 2, 3],
          start: 0,
          end: 100,
          id: 'klineInsideZoom'
        },
        {
          show: true,
          xAxisIndex: [0, 1, 2, 3],
          type: 'slider',
          bottom: '0%',
          start: 0,
          end: 100,
          id: 'klineSliderZoom'
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: values,
          itemStyle: {
            color: '#c23531',
            color0: '#314656',
            borderColor: '#c23531',
            borderColor0: '#314656'
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: amounts,
          itemStyle: {
            color: function(params) {
              const index = params.dataIndex;
              const close = klineData[index].close;
              const open = klineData[index].open;
              return close > open ? '#c23531' : '#314656';
            }
          }
        },
        {
          name: '真实涨跌',
          type: 'line',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: realChangeValues,
          smooth: true,
          itemStyle: {
            color: function(params) {
              // 涨跌颜色：涨为红色，跌为绿色
              return params.value >= 0 ? '#c23531' : '#3fbf67';
            }
          },
          label: {
            show: false,
            position: function(params) {
              return params.value >= 0 ? 'top' : 'bottom';
            },
            formatter: function(params) {
              return params.value.toFixed(2) + '%';
            },
            fontSize: 10,
            distance: 5,
            color: function(params) {
              return params.value >= 0 ? '#c23531' : '#3fbf67';
            }
          },
          markLine: {
            symbol: 'none',
            data: [
              {
                yAxis: 0,
                lineStyle: {
                  color: '#999',
                  type: 'dashed'
                },
                label: {
                  show: true,
                  position: 'end',
                  formatter: '0%'
                }
              }
            ]
          }
        },
        {
          name: '对比涨跌',
          type: 'bar',
          xAxisIndex: 3,
          yAxisIndex: 3,
          data: comparativeChangeValues.map(val => isNaN(val) ? 0 : val), // 确保没有NaN值
          label: {
            show: false
          },
          itemStyle: {
            color: function(params) {
              // 确保值存在且不是NaN
              if (params.value === undefined || isNaN(params.value)) return '#999';
              return params.value >= 0 ? '#c23531' : '#3fbf67';
            }
          },
          markLine: {
            symbol: 'none',
            data: [
              {
                yAxis: 0,
                lineStyle: {
                  color: '#999',
                  type: 'dashed'
                },
                label: {
                  show: true,
                  position: 'end',
                  formatter: '0%'
                }
              }
            ]
          }
        }
      ]
    };

    // 设置图表选项
    chartInstance.current.setOption(option);
    
    // 添加dataZoom事件监听，触发自定义事件通知其他图表
    chartInstance.current.on('dataZoom', function(params) {
      // 创建自定义事件，传递dataZoom信息
      const event = new CustomEvent('echarts:dataZoom', {
        detail: params
      });
      // 触发事件，通知其他图表
      window.dispatchEvent(event);
    });
  }, [data, realChangeData, theme, title]);

  return (
    <div>
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '72vh',  // 调整为原来的80%（原来90vh*80%=72vh）
          margin: '0 0 20px 0' // 添加一些下边距
        }}
        className="kline-chart-container"
      />
    </div>
  );
};

export default StockKLineChart;