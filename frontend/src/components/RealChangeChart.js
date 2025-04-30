// frontend/src/components/RealChangeChart.js
/**
 * 此组件用于展示股票真实涨跌图表。
 * 使用ECharts绘制以日期为横轴，real_change为纵轴的柱状图。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { formatDate } from '../utils/formatters';
import { getStockKline, getStockRealChange } from '../services/stockService';

/**
 * 真实涨跌图表组件
 * @param {Object} props - 组件属性
 * @param {string} props.symbol - 股票代码
 * @param {string} props.title - 图表标题
 * @param {string} props.theme - 图表主题，'light'或'dark'
 * @param {Object} props.data - K线数据，用于同步日期范围
 */
const RealChangeChart = ({ symbol, title = '股票真实涨跌', theme = 'light', data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [klineData, setKlineData] = useState(null);
  const [realChangeData, setRealChangeData] = useState(null);

  // 获取K线数据和真实涨跌数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 如果传入了K线数据，直接使用
        if (data) {
          setKlineData(data);
          
          // 获取真实涨跌数据，传递相同的日期范围
          const realChangeResponse = await getStockRealChange(symbol, {
            start_date: data.data[0]?.date,
            end_date: data.data[data.data.length - 1]?.date
          });
          setRealChangeData(realChangeResponse);
        } else {
          // 如果没有传入K线数据，则自行获取
          const klineResponse = await getStockKline(symbol);
          setKlineData(klineResponse);
          
          // 获取真实涨跌数据，传递相同的日期范围
          const realChangeResponse = await getStockRealChange(symbol, {
            start_date: klineResponse.data[0]?.date,
            end_date: klineResponse.data[klineResponse.data.length - 1]?.date
          });
          setRealChangeData(realChangeResponse);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, data]);

  // 初始化图表
  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current, theme);
      
      // 将图表添加到stockCharts组，实现联动
      echarts.connect('stockCharts');

      // 监听窗口大小变化，调整图表大小
      const resizeHandler = () => {
        chartInstance.current.resize();
      };
      window.addEventListener('resize', resizeHandler);
      
      // 监听K线图的dataZoom事件，实现联动
      const handleDataZoomEvent = (event) => {
        if (event.detail && event.detail.batch && chartInstance.current) {
          chartInstance.current.dispatchAction({
            type: 'dataZoom',
            start: event.detail.batch[0].start,
            end: event.detail.batch[0].end
          });
        }
      };
      
      // 添加事件监听
      window.addEventListener('echarts:dataZoom', handleDataZoomEvent);

      return () => {
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('echarts:dataZoom', handleDataZoomEvent);
        chartInstance.current.dispose();
      };
    }
  }, [theme]);

  // 更新图表数据
  useEffect(() => {
    if (!chartInstance.current || !klineData || !klineData.data || klineData.data.length === 0 || !realChangeData || !realChangeData.data) return;

    const klineDataArray = klineData.data;
    const realChangeDataArray = realChangeData.data;
    const dates = klineDataArray.map(item => item.date);
    // 确保数据按日期排序
    const sortedData = [...klineDataArray].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 创建真实涨跌数据数组，每个日期对应一个值
    const realChangeValues = sortedData.map(item => {
      const matchingItem = realChangeDataArray.find(rcItem => rcItem.date === item.date);
      return matchingItem ? matchingItem.real_change : 0;
    });

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 14 // 减小标题字体大小
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          if (!params || !params[0]) return '';
          
          return `
            <div style="padding: 5px">
              <p style="margin: 0">${formatDate(params[0].axisValue)}</p>
              <p style="margin: 0">真实涨跌: ${params[0].value.toFixed(2)}%</p>
            </div>
          `;
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '12%',
        bottom: '10%'
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          formatter: function(value) {
            return formatDate(value, 'MM-DD');
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '真实涨跌(%)',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 100,
          // 添加id以便与K线图联动
          id: 'realChangeInsideZoom'
        },
        {
          show: false, // 隐藏滑块，因为K线图已经有了滑块
          type: 'slider',
          bottom: '0%',
          start: 0,
          end: 100,
          // 添加id以便与K线图联动
          id: 'realChangeSliderZoom'
        }
      ],
      series: [
        {
          name: '真实涨跌',
          type: 'bar',
          data: realChangeValues,
          itemStyle: {
            color: function(params) {
              // 涨跌颜色：涨为红色，跌为绿色
              return params.value >= 0 ? '#c23531' : '#3fbf67';
            }
          }
        }
      ]
    };

    // 设置图表选项
    chartInstance.current.setOption(option);
  }, [klineData, realChangeData, theme, title]);

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: '25vh',  // 减小高度，使其适合在K线图和量能图之间
        margin: '0' // 移除边距，让布局更紧凑
      }}
      className="real-change-chart-container"
    />
  );
};

export default RealChangeChart;