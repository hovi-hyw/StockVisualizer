// frontend/src/services/etfService.js
/**
 * 此模块提供ETF数据相关的服务。
 * 封装了获取ETF列表、ETF详情和K线数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-25
 */

import api from './api';

/**
 * 获取ETF列表
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.page_size - 每页数量，默认为20
 * @param {string} params.search - 搜索关键词，可选
 * @returns {Promise<Object>} ETF列表数据
 */
export const getETFList = async (params = {}) => {
  try {
    const response = await api.get('/etfs', { params });
    return response;
  } catch (error) {
    console.error('获取ETF列表失败:', error);
    throw error;
  }
};

/**
 * 获取ETF详情
 * @param {string} symbol - ETF代码
 * @returns {Promise<Object>} ETF详情数据
 */
export const getETFInfo = async (symbol) => {
  try {
    const response = await api.get(`/etfs/${symbol}`);
    return response;
  } catch (error) {
    console.error(`获取ETF${symbol}详情失败:`, error);
    throw error;
  }
};

/**
 * 获取ETF K线数据
 * @param {string} symbol - ETF代码
 * @param {Object} params - 请求参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} ETF K线数据
 */
export const getETFKline = async (symbol, params = {}) => {
  try {
    const response = await api.get(`/etfs/${symbol}/kline`, { params });
    return response;
  } catch (error) {
    console.error(`获取ETF${symbol}K线数据失败:`, error);
    throw error;
  }
};

/**
 * 获取ETF对比涨跌数据
 * @param {string} symbol - ETF代码
 * @param {Object} params - 请求参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} ETF对比涨跌数据
 */
export const getETFComparativeChange = async (symbol, params = {}) => {
  try {
    // 直接使用K线数据接口，后端已经在K线数据中包含了参考指数信息
    const response = await api.get(`/etfs/${symbol}/kline`, { params });
    return response;
  } catch (error) {
    console.error(`获取ETF${symbol}对比涨跌数据失败:`, error);
    throw error;
  }
};