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
 * @param {string} params.cursor - 分页游标，用于获取下一页数据
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.page_size - 每页数量，默认20
 * @param {string} params.search - 搜索关键字
 * @param {AbortSignal} params.signal - 用于取消请求的信号
 * @returns {Promise<Object>} 股票列表数据
 */
export const getStockList = async (params = {}) => {
  const { cursor, page, page_size = 20, search = '', signal } = params;
  const queryParams = {
    page_size,
    ...(cursor ? { cursor } : {}),
    ...(page ? { page } : {}),
    ...(search ? { search } : {})
  };

  try {
    // 添加请求配置，支持取消请求和自定义超时
    const config = { 
      params: queryParams,
      ...(signal ? { signal } : {}),
    };
    
    const response = await api.get('/stocks', config);
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