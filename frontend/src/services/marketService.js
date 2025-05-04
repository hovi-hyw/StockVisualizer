// frontend/src/services/marketService.js
/**
 * 此模块提供市场数据相关的服务。
 * 封装了获取市场指数实时数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import api from './api';

/**
 * 获取市场主要指数实时数据
 * 返回上证指数、深证成指、创业板指和科创50的最新数据
 * @returns {Promise<Object>} 市场指数数据
 */
export const getMarketIndices = async () => {
  try {
    const response = await api.get('/market/indices');
    return response;
  } catch (error) {
    console.error('获取市场指数数据失败:', error);
    throw error;
  }
};