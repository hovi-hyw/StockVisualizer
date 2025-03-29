// frontend/src/components/KLineChart.js
/**
 * 此组件用于展示K线图。
 * 使用ECharts绘制股票或指数的K线图。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { formatDate, formatLargeNumber } from '../utils/formatters';

/**
 * K线图组件
 * @param {Object} props - 组件属性
 * @param {Array} props.data - K线数据
 * @param {string} props.title - 图表标题
 * @param {string} props.theme - 图表主题，'light'或'dark'
 */
const KLineChart = ({ data, title = '股票K线图', theme = 'light' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current, theme);

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

          return `
            <div style="padding: 5px">
              <p style="margin: 0">${formatDate(params[0].axisValue)}</p>
              <p style="margin: 0">开盘: ${parseFloat(open).toFixed(2)}</p>
              <p style="margin: 0">收盘: ${parseFloat(close).toFixed(2)}</p>
              <p style="margin: 0">最低: ${parseFloat(low).toFixed(2)}</p>
              <p style="margin: 0">最高: ${parseFloat(high).toFixed(2)}</p>
              <p style="margin: 0">成交量: ${formatLargeNumber(volume)}</p>
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
          left: '3%',
          right: '3%',
          height: '60%'
        },
        {
          left: '3%',
          right: '3%',
          top: '75%',
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
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: '0%',
          start: 0,
          end: 100
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
        }
      ]
    };

    // 设置图表选项
    chartInstance.current.setOption(option);
  }, [data, theme, title]);

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '500px' }}
      className="kline-chart-container"
    />
  );
};

export default KLineChart;