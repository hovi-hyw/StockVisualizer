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
    const results = {};
    
    // 并行获取所有市场的K线数据
    const promises = markets.map(market => getMarketKLineData(market));
    const responses = await Promise.all(promises);
    
    // 将结果组织成对象形式
    markets.forEach((market, index) => {
      results[market] = responses[index];
    });
    
    return results;
  } catch (error) {
    console.error('获取所有市场K线数据失败:', error);
    throw error;
  }
};