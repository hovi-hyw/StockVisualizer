// frontend/src/services/marketDistributionService.js
/**
 * 此模块提供市场分布数据相关的服务。
 * 封装了获取股票市场分布数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-04-10
 */

import api from './api';

/**
 * 获取股票市场分布数据
 * @param {string} symbol - 市场代码 (北证板:899050, 科创板:000698, 创业板:399006, A股所有个股:000001)
 * @returns {Promise<Array>} 市场分布数据列表
 */
export const getMarketDistribution = async (symbol) => {
  try {
    const response = await api.get(`/market/distribution/${symbol}`);
    return response;
  } catch (error) {
    console.error('获取市场分布数据失败:', error);
    throw error;
  }
};

/**
 * 获取指数真实变化数据
 * @param {string} symbol - 市场代码
 * @returns {Promise<Array>} 指数真实变化数据列表
 */
export const getIndexRealChange = async (symbol) => {
  try {
    const response = await api.get(`/indices/${symbol}/real-change`);
    return response;
  } catch (error) {
    console.error(`获取指数${symbol}真实变化数据失败:`, error);
    throw error;
  }
};