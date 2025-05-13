// frontend/src/services/fundService.js
/**
 * 此模块提供基金数据相关的服务。
 * 封装了获取基金列表、基金详情和基金净值数据的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-04-02
 */

import api from './api';

/**
 * 获取基金列表
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.page_size - 每页数量，默认为20
 * @param {string} params.search - 搜索关键词，可选
 * @param {string} params.type - 基金类型，可选（股票型、混合型、债券型、指数型等）
 * @returns {Promise<Object>} 基金列表数据
 */
export const getFundList = async (params = {}) => {
  try {
    const response = await api.get('/funds', { params });
    return response;
  } catch (error) {
    console.error('获取基金列表失败:', error);
    throw error;
  }
};

/**
 * 获取基金详情
 * @param {string} code - 基金代码
 * @returns {Promise<Object>} 基金详情数据
 */
export const getFundInfo = async (code) => {
  try {
    const response = await api.get(`/funds/${code}`);
    return response;
  } catch (error) {
    console.error(`获取基金${code}详情失败:`, error);
    throw error;
  }
};

/**
 * 获取基金净值数据
 * @param {string} code - 基金代码
 * @param {Object} params - 请求参数
 * @param {string} params.start_date - 开始日期 (YYYY-MM-DD)
 * @param {string} params.end_date - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 基金净值数据
 */
export const getFundNav = async (code, params = {}) => {
  try {
    const response = await api.get(`/funds/${code}/nav`, { params });
    return response;
  } catch (error) {
    console.error(`获取基金${code}净值数据失败:`, error);
    throw error;
  }
};

/**
 * 获取热门基金列表
 * @param {Object} params - 请求参数
 * @param {number} params.limit - 返回数量限制，默认为5
 * @param {string} params.type - 基金类型，可选（股票型、混合型、债券型、指数型等）
 * @returns {Promise<Array>} 热门基金列表
 */
export const getHotFunds = async (params = {}) => {
  try {
    const response = await api.get('/funds/hot', { params });
    return response;
  } catch (error) {
    console.error('获取热门基金列表失败:', error);
    throw error;
  }
};

/**
 * 获取价值型ETF列表
 * @param {Object} params - 请求参数
 * @param {string} [params.sort_by] - 排序字段，可选值：name(名称), price(金额), change(涨幅)
 * @param {string} [params.sort_order] - 排序顺序，可选值：asc(升序), desc(降序)，默认为desc
 * @returns {Promise<Array>} 价值型ETF列表
 */
export const getValueETFs = async (params = {}) => {
  try {
    const response = await api.get('/funds/value-etfs', { params });
    return response;
  } catch (error) {
    console.error('获取价值型ETF列表失败:', error);
    throw error;
  }
};