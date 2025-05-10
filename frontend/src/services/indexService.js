// frontend/src/services/indexService.js
/**
 * 此模块提供指数数据相关的服务。
 * 封装了获取指数列表、详情、K线数据和真实涨跌数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 * 更新: 2025-03-16 - 添加获取指数真实涨跌数据的方法
 */

import api from './api';

/**
 * 获取指数列表
 * @param {Object} params - 请求参数
 * @param {string} params.cursor - 分页游标，用于获取下一页数据
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.page_size - 每页数量，默认20
 * @param {string} params.search - 搜索关键字
 * @returns {Promise<Object>} 指数列表数据
 */
export const getIndexList = async (params = {}) => {
  const { cursor, page, page_size = 20, search = '' } = params;
  const queryParams = {
    page_size,
    ...(cursor ? { cursor } : {}),
    ...(page ? { page } : {}),
    ...(search ? { search } : {})
  };

  try {
    const response = await api.get('/indices', { params: queryParams });
    return response;
  } catch (error) {
    console.error('获取指数列表失败:', error);
    throw error;
  }
};

/**
 * 获取指数详情
 * @param {string} symbol - 指数代码
 * @returns {Promise<Object>} 指数详情数据
 */
export const getIndexInfo = async (symbol) => {
  try {
    const response = await api.get(`/indices/${symbol}`);
    return response;
  } catch (error) {
    console.error(`获取指数${symbol}详情失败:`, error);
    throw error;
  }
};

/**
 * 获取指数K线数据
 * @param {string} symbol - 指数代码
 * @param {Object} params - 请求参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 指数K线数据
 */
export const getIndexKline = async (symbol, params = {}) => {
  try {
    const response = await api.get(`/indices/${symbol}/kline`, { params });
    return response;
  } catch (error) {
    console.error(`获取指数${symbol}K线数据失败:`, error);
    throw error;
  }
};

/**
 * 获取指数涨跌幅数据
 * @param {string} symbol - 指数代码
 * @param {Object} params - 请求参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 指数涨跌幅数据
 */
export const getIndexChangeRate = async (symbol, params = {}) => {
  try {
    // 使用正确的指数API路径格式
    const response = await api.get(`/indices/${symbol}/real-change`, { params });
    return response;
  } catch (error) {
    console.error(`获取指数${symbol}真实涨跌数据失败:`, error);
    throw error;
  }
};