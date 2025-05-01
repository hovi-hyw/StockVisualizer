// frontend/src/components/KLineChart.js
/**
 * 此组件用于展示K线图。
 * 使用ECharts绘制股票或指数的K线图，包含K线、量能和真实涨跌三个子图表。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { formatDate, formatLargeNumber } from '../utils/formatters';
import { getStockRealChange } from '../services/stockService';

/**
 * K线图组件
 * @param {Object} props - 组件属性
 * @param {Array} props.data - K线数据
 * @param {string} props.title - 图表标题
 * @param {string} props.theme - 图表主题，'light'或'dark'
 * @param {string} props.symbol - 股票代码，用于获取真实涨跌数据
 */
const KLineChart = ({ data, title = '股票K线图', theme = 'light', symbol }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [realChangeData, setRealChangeData] = useState(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current, theme);
      
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
  }, [theme]);

  // 获取真实涨跌数据
  useEffect(() => {
    const fetchRealChangeData = async () => {
      if (!data || !data.data || data.data.length === 0 || !symbol) return;
      
      try {
        // 获取真实涨跌数据，传递相同的日期范围
        const realChangeResponse = await getStockRealChange(symbol, {
          start_date: data.data[0]?.date,
          end_date: data.data[data.data.length - 1]?.date
        });
        
        // 确保返回的数据有效
        if (realChangeResponse && realChangeResponse.data && realChangeResponse.data.length > 0) {
          console.log('成功获取真实涨跌数据:', realChangeResponse.data.length, '条');
          setRealChangeData(realChangeResponse);
        } else {
          console.error('获取的真实涨跌数据为空');
        }
      } catch (error) {
        console.error('获取真实涨跌数据失败:', error);
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
    const volumes = sortedData.map(item => parseFloat(item.volume));
    
    // 创建真实涨跌数据数组
    let realChangeValues = [];
    if (realChangeData && realChangeData.data) {
      const realChangeDataArray = realChangeData.data;
      realChangeValues = sortedData.map(item => {
        const matchingItem = realChangeDataArray.find(rcItem => rcItem.date === item.date);
        // 确保将真实涨跌值转换为数字类型
        return matchingItem ? parseFloat(matchingItem.real_change) : 0;
      });
      // 确保真实涨跌数据有效
      if (realChangeValues.length === 0 || realChangeValues.every(val => val === 0)) {
        console.warn('真实涨跌数据为空或全为0，请检查数据源');
      } else {
        console.log('真实涨跌数据已加载:', realChangeValues.length, '条');
      }
    }

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
          
          // 获取真实涨跌数据
          let realChange = '暂无数据';
          if (realChangeValues && realChangeValues.length > index) {
            realChange = realChangeValues[index].toFixed(2) + '%';
          }

          return `
            <div style="padding: 5px">
              <p style="margin: 0">${formatDate(params[0].axisValue)}</p>
              <p style="margin: 0">开盘: ${parseFloat(open).toFixed(2)}</p>
              <p style="margin: 0">收盘: ${parseFloat(close).toFixed(2)}</p>
              <p style="margin: 0">最低: ${parseFloat(low).toFixed(2)}</p>
              <p style="margin: 0">最高: ${parseFloat(high).toFixed(2)}</p>
              <p style="margin: 0">成交量: ${formatLargeNumber(volume)}</p>
              <p style="margin: 0">真实涨跌: ${realChange}</p>
            </div>
          `;
        }
      },
      legend: {
        data: ['K线', '成交量'],
        left: 'right'
      },
      grid: [
        {
          left: '5%',
          right: '5%',
          height: '60%'
        },
        {
          left: '5%',
          right: '5%',
          top: '65%',
          height: '15%'
        },
        {
          left: '5%',
          right: '5%',
          top: '85%',
          height: '15%'
        }
      ],
      xAxis: [
        {
          type: 'category',
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
          axisLabel: { show: true },
          splitNumber: 20
        }
      ],
      yAxis: [
        {
          scale: true,
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
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1, 2],
          start: 0,
          end: 100,
          id: 'klineInsideZoom'
        },
        {
          show: true,
          xAxisIndex: [0, 1, 2],
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
          data: volumes,
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
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: realChangeValues,
          itemStyle: {
            color: function(params) {
              // 涨跌颜色：涨为红色，跌为绿色
              return params.value >= 0 ? '#c23531' : '#3fbf67';
            }
          },
          // 添加标签显示数值
          label: {
            show: true,
            position: function(params) {
              // 根据值的正负决定标签位置
              return params.value >= 0 ? 'top' : 'bottom';
            },
            formatter: function(params) {
              // 格式化为保留两位小数的百分比
              return params.value.toFixed(2) + '%';
            },
            fontSize: 10,
            distance: 5,
            color: function(params) {
              // 标签颜色与柱状图一致
              return params.value >= 0 ? '#c23531' : '#3fbf67';
            }
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
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: '90vh',  // 使用视口高度单位，占据90%的视口高度
        margin: '20px 0' // 添加一些上下边距
      }}
      className="kline-chart-container"
    />
  );
};

export default KLineChart;