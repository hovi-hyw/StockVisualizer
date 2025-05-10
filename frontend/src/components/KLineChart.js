// frontend/src/components/KLineChart.js
/**
 * 此组件用于展示K线图。
 * 使用ECharts绘制股票或指数的K线图，包含K线、量能、真实涨跌和对比涨跌四个子图表。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-15 - 添加对比涨跌图表，调整图表高度为原来的80%
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { formatDate, formatLargeNumber } from '../utils/formatters';
import { getStockRealChange } from '../services/stockService';
import { getIndexRealChange } from '../services/indexService';

/**
 * K线图组件
 * @param {Object} props - 组件属性
 * @param {Array} props.data - K线数据
 * @param {string} props.title - 图表标题
 * @param {string} props.theme - 图表主题，'light'或'dark'
 * @param {string} props.symbol - 证券代码，用于获取真实涨跌数据
 * @param {string} props.type - 证券类型，'stock'、'index'或'etf'
 */
const KLineChart = ({ data, title = '股票K线图', theme = 'light', symbol, type = 'stock' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [realChangeData, setRealChangeData] = useState(null);
  const [indexRealChangeData, setIndexRealChangeData] = useState(null); // 添加沪深300指数真实涨跌数据状态
  // 判断是否为股票类型，只有股票类型才显示真实涨跌图表
  const isStock = type === 'stock'

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
        
        // 根据证券类型获取不同的真实涨跌数据
        if (isStock) {
          // 获取个股真实涨跌数据
          const realChangeResponse = await getStockRealChange(symbol, dateParams);
          
          // 确保返回的数据有效
          if (realChangeResponse && realChangeResponse.data && realChangeResponse.data.length > 0) {
            console.log('成功获取股票真实涨跌数据:', realChangeResponse.data.length, '条');
            setRealChangeData(realChangeResponse);
          } else {
            console.error('获取的股票真实涨跌数据为空');
          }
        } else if (type === 'index' || type === 'etf') {
          // 获取指数或ETF对比涨跌数据
          const indexRealChangeResponse = type === 'index' 
            ? await getIndexRealChange(symbol, dateParams)
            : await import('../services/etfService').then(module => module.getETFComparativeChange(symbol, dateParams));
            
          if (indexRealChangeResponse && indexRealChangeResponse.data && indexRealChangeResponse.data.length > 0) {
            console.log(`成功获取${type === 'index' ? '指数' : 'ETF'}对比涨跌数据:`, indexRealChangeResponse.data.length, '条');
            setIndexRealChangeData(indexRealChangeResponse);
          } else {
            console.error(`获取的${type === 'index' ? '指数' : 'ETF'}对比涨跌数据为空`);
          }
        }
      } catch (error) {
        console.error(`获取${type}真实涨跌数据失败:`, error);
      }
    };

    fetchRealChangeData();
  }, [data, symbol, isStock, type]);

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
    
    // 根据证券类型确定参考指数
    let defaultReferenceName = '无参考';
    let defaultReferenceIndex = '';
    
    if (type === 'etf') {
      // ETF参考指数选择逻辑
      if (symbol && symbol.startsWith('159')) {
        // 159开头的ETF参考深证综指
        defaultReferenceName = '深证综指';
        defaultReferenceIndex = '399001';
      } else if (symbol && (symbol.startsWith('510') || symbol.startsWith('511') || symbol.startsWith('512'))) {
        // 510/511/512开头的ETF参考上证综指
        defaultReferenceName = '上证综指';
        defaultReferenceIndex = '000001';
      } else {
        // 其他ETF参考沪深300
        defaultReferenceName = '沪深300';
        defaultReferenceIndex = '000300';
      }
    } else if (type === 'index') {
      // 指数参考指数选择逻辑
      if (symbol && symbol.startsWith('000')) {
        // 000开头的指数参考上证综指
        defaultReferenceName = '上证综指';
        defaultReferenceIndex = '000001';
      } else if (symbol && symbol.startsWith('399')) {
        // 399开头的指数参考深证综指
        defaultReferenceName = '深证综指';
        defaultReferenceIndex = '399001';
      } else {
        // 其他指数参考沪深300
        defaultReferenceName = '沪深300';
        defaultReferenceIndex = '000300';
      }
    }
    
    // 处理真实涨跌数据和对比涨跌数据
    // 根据证券类型处理不同的数据源
    if (isStock && realChangeData && realChangeData.data) {
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
    } else if ((type === 'index' || type === 'etf') && indexRealChangeData && indexRealChangeData.data) {
      // 处理指数或ETF的对比涨跌数据
      const indexRealChangeDataArray = indexRealChangeData.data;
      
      // 对于指数和ETF，直接计算对比涨跌值（当天涨跌幅减去参考指数当天涨跌幅）
      comparativeChangeValues = sortedData.map(item => {
        const matchingItem = indexRealChangeDataArray.find(rcItem => rcItem.date === item.date);
        if (!matchingItem) return 0;
        
        // 添加调试日志，查看原始数据
        console.log('日期:', item.date, '原始数据:', matchingItem);
        
        // 检查daily_change或change_rate是否存在且为有效数值
        let dailyChange = 0;
        // 首先尝试使用change_rate字段（数据库中的实际字段名）
        if (matchingItem.change_rate !== null && matchingItem.change_rate !== undefined) {
          // 尝试直接使用数值，如果是字符串则解析
          const parsedDailyChange = typeof matchingItem.change_rate === 'number' 
            ? matchingItem.change_rate 
            : parseFloat(matchingItem.change_rate);
          
          console.log('解析前change_rate值:', matchingItem.change_rate, '类型:', typeof matchingItem.change_rate);
          console.log('解析后change_rate值:', parsedDailyChange);
          
          if (!isNaN(parsedDailyChange)) {
            dailyChange = parsedDailyChange * 100;
          }
        } 
        // 如果change_rate不存在，则尝试使用daily_change字段（API可能使用的映射字段名）
        else if (matchingItem.daily_change !== null && matchingItem.daily_change !== undefined) {
          // 尝试直接使用数值，如果是字符串则解析
          const parsedDailyChange = typeof matchingItem.daily_change === 'number' 
            ? matchingItem.daily_change 
            : parseFloat(matchingItem.daily_change);
          
          console.log('解析前daily_change值:', matchingItem.daily_change, '类型:', typeof matchingItem.daily_change);
          console.log('解析后daily_change值:', parsedDailyChange);
          
          if (!isNaN(parsedDailyChange)) {
            dailyChange = parsedDailyChange * 100;
          }
        }
        
        // 检查reference_change或reference_rate是否存在且为有效数值
        let referenceChange = 0;
        // 首先尝试使用reference_rate字段（数据库中的实际字段名）
        if (matchingItem.reference_rate !== null && matchingItem.reference_rate !== undefined) {
          // 尝试直接使用数值，如果是字符串则解析
          const parsedReferenceChange = typeof matchingItem.reference_rate === 'number' 
            ? matchingItem.reference_rate 
            : parseFloat(matchingItem.reference_rate);
          
          console.log('解析前reference_rate值:', matchingItem.reference_rate, '类型:', typeof matchingItem.reference_rate);
          console.log('解析后reference_rate值:', parsedReferenceChange);
          
          if (!isNaN(parsedReferenceChange)) {
            referenceChange = parsedReferenceChange * 100;
          }
        }
        // 如果reference_rate不存在，则尝试使用reference_change字段（API可能使用的映射字段名）
        else if (matchingItem.reference_change !== null && matchingItem.reference_change !== undefined) {
          // 尝试直接使用数值，如果是字符串则解析
          const parsedReferenceChange = typeof matchingItem.reference_change === 'number' 
            ? matchingItem.reference_change 
            : parseFloat(matchingItem.reference_change);
          
          console.log('解析前reference_change值:', matchingItem.reference_change, '类型:', typeof matchingItem.reference_change);
          console.log('解析后reference_change值:', parsedReferenceChange);
          
          if (!isNaN(parsedReferenceChange)) {
            referenceChange = parsedReferenceChange * 100;
          }
        }
        
        // 对比涨跌 = 当天涨跌幅 - 参考指数当天涨跌幅
        const result = dailyChange - referenceChange;
        console.log('计算结果:', '日期=', item.date, '当日涨跌=', dailyChange.toFixed(2) + '%', 
                   '参考指数涨跌=', referenceChange.toFixed(2) + '%', '对比涨跌=', result.toFixed(2) + '%');
        return result;
      });
      
      // 检查计算后的对比涨跌数据是否有效
      const hasInvalidValues = comparativeChangeValues.some(val => isNaN(val));
      if (hasInvalidValues) {
        console.error('对比涨跌数据包含无效值(NaN)，请检查数据源');
      }
      
      // 使用默认参考指数名称和代码，确保与后端逻辑一致
      referenceNames = sortedData.map(() => defaultReferenceName);
      referenceIndices = sortedData.map(() => defaultReferenceIndex);
      
      // 如果后端返回了参考指数信息，则使用后端返回的数据
      if (indexRealChangeDataArray.length > 0 && indexRealChangeDataArray[0].reference_name) {
        referenceNames = sortedData.map(item => {
          const matchingItem = indexRealChangeDataArray.find(rcItem => rcItem.date === item.date);
          return matchingItem ? matchingItem.reference_name || defaultReferenceName : defaultReferenceName;
        });
        
        referenceIndices = sortedData.map(item => {
          const matchingItem = indexRealChangeDataArray.find(rcItem => rcItem.date === item.date);
          return matchingItem ? matchingItem.reference_index || defaultReferenceIndex : defaultReferenceIndex;
        });
      }
      
      console.log('对比涨跌数据已加载:', comparativeChangeValues.length, '条');
    }
    
    // 根据证券类型确定图表布局和显示内容
    // 计算网格布局和坐标轴索引
    let grids = [];
    let xAxisIndices = [];
    let yAxisIndices = [];
    let seriesConfig = [];
    
    // 确定是否显示真实涨跌和对比涨跌图表
    const showRealChange = isStock;
    const showComparativeChange = true; // 所有类型都显示对比涨跌
    
    // 设置主K线图网格
    grids.push({
      left: '5%',
      right: '5%',
      height: showRealChange ? '48%' : (showComparativeChange ? '60%' : '75%')
    });
    
    // 设置成交量图网格
    const volumeTopPosition = showRealChange ? '53%' : (showComparativeChange ? '65%' : '80%');
    grids.push({
      left: '5%',
      right: '5%',
      top: volumeTopPosition,
      height: '12%'
    });
    
    // 如果是股票类型，添加真实涨跌图网格
    if (showRealChange) {
      grids.push({
        left: '5%',
        right: '5%',
        top: '70%',
        height: '12%'
      });
    }
    
    // 添加对比涨跌图网格
    if (showComparativeChange) {
      const comparativeTopPosition = showRealChange ? '87%' : '82%';
      grids.push({
        left: '5%',
        right: '5%',
        top: comparativeTopPosition,
        height: '12%'
      });
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
          let referenceName = defaultReferenceName;
          let referenceIndex = '';
          let dailyChange = '暂无数据';
          let referenceChange = '暂无数据';
          
          if (showRealChange && realChangeValues && realChangeValues.length > index) {
            realChange = realChangeValues[index].toFixed(2) + '%';
          }
          if (comparativeChangeValues && comparativeChangeValues.length > index) {
            const value = comparativeChangeValues[index];
            comparativeChange = !isNaN(value) ? value.toFixed(2) + '%' : '暂无数据';
          }
          if (referenceNames && referenceNames.length > index) {
            referenceName = referenceNames[index] || defaultReferenceName;
          }
          if (referenceIndices && referenceIndices.length > index) {
            referenceIndex = referenceIndices[index];
          }
          
          // 对于指数和ETF，获取当日涨跌幅和参考指数涨跌幅
          if ((type === 'index' || type === 'etf') && indexRealChangeData && indexRealChangeData.data) {
            const matchingItem = indexRealChangeData.data.find(item => item.date === sortedData[index].date);
            if (matchingItem) {
              // 安全解析daily_change或change_rate
              if (matchingItem.change_rate !== null && matchingItem.change_rate !== undefined) {
                // 尝试直接使用数值，如果是字符串则解析
                const parsedDailyChange = typeof matchingItem.change_rate === 'number' 
                  ? matchingItem.change_rate 
                  : parseFloat(matchingItem.change_rate);
                
                if (!isNaN(parsedDailyChange)) {
                  dailyChange = (parsedDailyChange * 100).toFixed(2) + '%';
                }
              } else if (matchingItem.daily_change !== null && matchingItem.daily_change !== undefined) {
                // 尝试直接使用数值，如果是字符串则解析
                const parsedDailyChange = typeof matchingItem.daily_change === 'number' 
                  ? matchingItem.daily_change 
                  : parseFloat(matchingItem.daily_change);
                
                if (!isNaN(parsedDailyChange)) {
                  dailyChange = (parsedDailyChange * 100).toFixed(2) + '%';
                }
              }
              
              // 安全解析reference_change或reference_rate
              if (matchingItem.reference_rate !== null && matchingItem.reference_rate !== undefined) {
                // 尝试直接使用数值，如果是字符串则解析
                const parsedReferenceChange = typeof matchingItem.reference_rate === 'number' 
                  ? matchingItem.reference_rate 
                  : parseFloat(matchingItem.reference_rate);
                
                if (!isNaN(parsedReferenceChange)) {
                  referenceChange = (parsedReferenceChange * 100).toFixed(2) + '%';
                }
              } else if (matchingItem.reference_change !== null && matchingItem.reference_change !== undefined) {
                // 尝试直接使用数值，如果是字符串则解析
                const parsedReferenceChange = typeof matchingItem.reference_change === 'number' 
                  ? matchingItem.reference_change 
                  : parseFloat(matchingItem.reference_change);
                
                if (!isNaN(parsedReferenceChange)) {
                  referenceChange = (parsedReferenceChange * 100).toFixed(2) + '%';
                }
              }
            }
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
          
          // 根据类型添加不同的信息
          if (showRealChange) {
            tooltipContent += `<p style="margin: 0">真实涨跌: ${realChange}</p>`;
          }
          
          tooltipContent += `<p style="margin: 0">对比涨跌: ${comparativeChange}</p>`;
          tooltipContent += `<p style="margin: 0">参考指数: ${referenceText}</p>`;
          
          // 对于指数和ETF，显示当日涨跌幅和参考指数涨跌幅
          if ((type === 'index' || type === 'etf') && dailyChange !== '暂无数据') {
            tooltipContent += `<p style="margin: 0">当日涨跌幅: ${dailyChange}</p>`;
            tooltipContent += `<p style="margin: 0">参考指数涨跌幅: ${referenceChange}</p>`;
          }
          
          tooltipContent += `</div>`;
          
          return tooltipContent;
        }
      },
      legend: {
        data: ['K线', '成交量'],
        left: 'right'
      },
      grid: grids,
      xAxis: (() => {
        // 动态创建x轴配置
        const xAxes = [
          {
            type: 'category',
            gridIndex: 0, // 明确指定gridIndex为0
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
        ];
        
        // 如果显示真实涨跌图表，添加对应的x轴
        if (showRealChange) {
          xAxes.push({
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
          });
        }
        
        // 如果显示对比涨跌图表，添加对应的x轴
        if (showComparativeChange) {
          // 计算正确的网格索引
          const comparativeGridIndex = showRealChange ? 3 : 2;
          xAxes.push({
            type: 'category',
            gridIndex: comparativeGridIndex,  // 使用计算好的索引
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: true },
            splitNumber: 20
          });
        }
        
        return xAxes;
      })(),
      yAxis: (() => {
        // 动态创建y轴配置
        const yAxes = [
          {
            scale: true,
            gridIndex: 0, // 明确指定gridIndex为0
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
        ];
        
        // 如果显示真实涨跌图表，添加对应的y轴
        if (showRealChange) {
          yAxes.push({
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
          });
        }
        
        // 如果显示对比涨跌图表，添加对应的y轴
        if (showComparativeChange) {
          const comparativeGridIndex = showRealChange ? 3 : 2; // 计算正确的网格索引
          yAxes.push({
            scale: true,
            gridIndex: comparativeGridIndex,  // 使用计算好的索引
            splitNumber: 2,
            axisLabel: { 
              show: true,
              formatter: '{value}%'
            },
            axisLine: { show: true },
            axisTick: { show: true },
            splitLine: { show: false },
            name: '对比涨跌',
          });
        }
        
        return yAxes;
      })(),
      dataZoom: (() => {
        // 创建dataZoom索引数组
        const xAxisIndices = [0, 1];
        if (showRealChange) xAxisIndices.push(2);
        if (showComparativeChange) xAxisIndices.push(showRealChange ? 3 : 2);
        
        return [
          {
            type: 'inside',
            xAxisIndex: xAxisIndices,
            start: 0,
            end: 100,
            id: 'klineInsideZoom'
          },
          {
            show: true,
            xAxisIndex: xAxisIndices,
            type: 'slider',
            bottom: '0%',
            start: 0,
            end: 100,
            id: 'klineSliderZoom'
          }
        ];
      })(),
      series: (() => {
        // 创建基本系列
        const series = [
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
          }
        ];
        
        // 如果是股票类型，添加真实涨跌系列
        if (showRealChange) {
          series.push({
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
          });
        }
        
        // 添加对比涨跌系列
        if (showComparativeChange) {
          // 计算正确的网格索引
          const comparativeGridIndex = showRealChange ? 3 : 2;
          series.push({
            name: '对比涨跌',
            type: 'bar',
            xAxisIndex: comparativeGridIndex,  // 使用计算好的索引
            yAxisIndex: comparativeGridIndex,  // 使用计算好的索引
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
          });
        }
        
        return series;
      })()
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
  }, [data, realChangeData, indexRealChangeData, theme, title]);

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

export default KLineChart;