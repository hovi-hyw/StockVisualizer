// frontend/src/services/peRatioService.js
/**
 * 此模块提供市盈率相关的服务。
 * 封装了获取上证、深证、创业板、科创版的市盈率数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-28
 */

import api from './api';

/**
 * 获取指定市场的市盈率数据
 * @param {string} market 市场名称，可选值："上证", "深证", "创业板", "科创版"
 * @returns {Promise<Array>} 市盈率数据列表，包含日期、总市值、市盈率
 */
export const getMarketPERatio = async (market) => {
  try {
    // 确保market参数是有效的
    const validMarkets = ["上证", "深证", "创业板", "科创版"];
    if (!validMarkets.includes(market)) {
      throw new Error(`无效的市场参数: ${market}，有效值为: ${validMarkets.join(', ')}`);
    }
    
    const response = await api.get(`/market/pe-ratio?market=${encodeURIComponent(market)}`);
    return response;
  } catch (error) {
    console.error(`获取${market}市盈率数据失败:`, error);
    throw error;
  }
};

/**
 * 获取所有市场的市盈率数据
 * @returns {Promise<Object>} 包含所有市场市盈率数据的对象
 */
export const getAllMarketPERatios = async () => {
  try {
    const markets = ["上证", "深证", "创业板", "科创版"];
    const results = {};
    
    // 并行获取所有市场的市盈率数据
    const promises = markets.map(market => getMarketPERatio(market));
    const responses = await Promise.all(promises);
    
    // 将结果组织成对象形式
    markets.forEach((market, index) => {
      results[market] = responses[index];
    });
    
    return results;
  } catch (error) {
    console.error('获取所有市场市盈率数据失败:', error);
    throw error;
  }
};

/**
 * 获取指定市场的K线数据
 * @param {string} market 市场名称，可选值："上证", "深证", "创业板", "科创版"
 * @returns {Promise<Array>} K线数据列表
 */
export const getMarketKLineData = async (market) => {
  try {
    // 确保market参数是有效的
    const validMarkets = ["上证", "深证", "创业板", "科创版"];
    if (!validMarkets.includes(market)) {
      throw new Error(`无效的市场参数: ${market}，有效值为: ${validMarkets.join(', ')}`);
    }
    
    const response = await api.get(`/market/kline?market=${encodeURIComponent(market)}`);
    return response;
  } catch (error) {
    console.error(`获取${market}K线数据失败:`, error);
    throw error;
  }
};

/**
 * 获取所有市场的K线数据
 * @returns {Promise<Object>} 包含所有市场K线数据的对象
 */
export const getAllMarketKLineData = async () => {
  try {
    const markets = ["上证", "深证", "创业板", "科创版"];
    const marketCodeMap = {
      "上证": "000001",
      "深证": "399001",
      "创业板": "399006",
      "科创版": "000688"
    };
    const results = {};
    
    // 并行获取指定市场的K线数据
    const promises = markets.map(market => 
      api.get(`/indices/${marketCodeMap[market]}/kline`)
    );
    const responses = await Promise.all(promises);
    
    // 将结果组织成对象形式，并处理数据格式
    markets.forEach((market, index) => {
      // 确保响应数据存在且包含data字段
      if (responses[index] && responses[index].data) {
        // 提取K线数据并格式化为与市盈率数据相同的格式
        const klineData = responses[index].data.map(item => ({
          date: item.date,  // 确保日期格式一致
          close: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume
        }));
        results[market] = klineData;
      } else {
        results[market] = [];
      }
    });
    
    return results;
  } catch (error) {
    console.error('获取市场K线数据失败:', error);
    throw error;
  }
};

/**
 * 处理市盈率和K线数据，确保日期对齐
 * 特别处理科创板的数据，因为科创板的日期是连续的，而其他市场是按月返回的
 * @param {Object} peRatioData 市盈率数据
 * @param {Object} klineData K线数据
 * @returns {Object} 处理后的市盈率数据
 */
export const processMarketData = (peRatioData, klineData) => {
  const markets = ["上证", "深证", "创业板", "科创版"];
  const processedData = {};
  
  markets.forEach(market => {
    const marketPEData = peRatioData[market] || [];
    const marketKlineData = klineData[market] || [];
    
    // 如果是科创板，需要特殊处理
    if (market === "科创版" && marketPEData.length > 0 && marketKlineData.length > 0) {
      // 创建K线数据日期到收盘价的映射
      const klineDateMap = {};
      marketKlineData.forEach(item => {
        klineDateMap[item.date] = item.close;
      });
      
      // 处理科创板数据，确保每个市盈率数据点都有对应的K线数据
      const processedPEData = marketPEData.map(item => {
        // 如果当前日期有K线数据，则使用K线数据的收盘价
        if (klineDateMap[item.date]) {
          return {
            ...item,
            // 使用K线数据的收盘价作为指数值
            index_value: klineDateMap[item.date]
          };
        }
        return item;
      });
      
      processedData[market] = processedPEData;
    } else {
      // 其他市场直接使用原始数据
      processedData[market] = marketPEData;
    }
  });
  
  return processedData;
};