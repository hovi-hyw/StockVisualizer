// frontend/src/services/stockService.js
/**
 * 此模块提供股票数据相关的服务。
 * 封装了获取股票列表、详情和K线数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import api from './api';

/**
 * 获取股票列表
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认20
 * @param {string} params.search - 搜索关键字
 * @returns {Promise<Object>} 股票列表数据
 */
export const getStockList = async (params = {}) => {
  const { page = 1, page_size = 20, search = '' } = params;
  const queryParams = {
    page,
    page_size,
    ...(search ? { search } : {})
  };

  try {
    const response = await api.get('/stocks', { params: queryParams });
    return response;
  } catch (error) {
    console.error('获取股票列表失败:', error);
    throw error;
  }
};

/**
 * 获取股票详情
 * @param {string} symbol - 股票代码
 * @returns {Promise<Object>} 股票详情数据
 */
export const getStockInfo = async (symbol) => {
  try {
    const response = await api.get(`/stocks/${symbol}`);
    return response;
  } catch (error) {
    console.error(`获取股票${symbol}详情失败:`, error);
    throw error;
  }
};

/**
 * 获取股票K线数据
 * @param {string} symbol - 股票代码
 * @param {Object} params - 请求参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 股票K线数据
 */
export const getStockKline = async (symbol, params = {}) => {
  try {
    const response = await api.get(`/stocks/${symbol}/kline`, { params });
    return response;
  } catch (error) {
    console.error(`获取股票${symbol}K线数据失败:`, error);
    throw error;
  }
};