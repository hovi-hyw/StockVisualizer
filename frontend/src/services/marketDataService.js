// frontend/src/services/marketDataService.js
/**
 * 此模块提供市场数据相关的服务。
 * 封装了获取市场热门行业、概念板块、热门个股、昨日热门、个股资金和市场资讯的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-17
 * 更新: 2025-03-20 - 添加热门个股、昨日热门和个股资金流向API
 * 更新: 2025-03-27 - 添加获取行业和概念板块相关个股数据的API
 */

import api from './api';

/**
 * 获取热门行业数据
 * @returns {Promise<Array>} 热门行业数据列表
 */
export const getHotIndustries = async () => {
  try {
    const response = await api.get('/market/hot-industries');
    return response;
  } catch (error) {
    console.error('获取热门行业数据失败:', error);
    throw error;
  }
};

/**
 * 获取概念板块数据
 * @returns {Promise<Array>} 概念板块数据列表
 */
export const getConceptSectors = async () => {
  try {
    const response = await api.get('/market/concept-sectors');
    return response;
  } catch (error) {
    console.error('获取概念板块数据失败:', error);
    throw error;
  }
};

/**
 * 获取市场资讯数据
 * @returns {Promise<Array>} 市场资讯数据列表
 */
export const getMarketNews = async () => {
  try {
    const response = await api.get('/market/market-news');
    return response;
  } catch (error) {
    console.error('获取市场资讯数据失败:', error);
    throw error;
  }
};

/**
 * 获取热门个股数据
 * @returns {Promise<Array>} 热门个股数据列表
 */
export const getHotStocks = async () => {
  try {
    const response = await api.get('/stocks/hot-stocks');
    return response;
  } catch (error) {
    console.error('获取热门个股数据失败:', error);
    throw error;
  }
};

/**
 * 获取昨日热门个股数据
 * @returns {Promise<Array>} 昨日热门个股数据列表
 */
export const getYesterdayHotStocks = async () => {
  try {
    const response = await api.get('/stocks/yesterday-hot');
    return response;
  } catch (error) {
    console.error('获取昨日热门个股数据失败:', error);
    throw error;
  }
};

/**
 * 获取个股资金流向数据
 * @returns {Promise<Array>} 个股资金流向数据列表
 */
export const getStockFunds = async () => {
  try {
    const response = await api.get('/stocks/stock-funds');
    return response;
  } catch (error) {
    console.error('获取个股资金流向数据失败:', error);
    throw error;
  }
};

/**
 * 获取行业板块相关个股数据
 * @param {string} industryName 行业名称
 * @returns {Promise<Array>} 行业相关个股数据列表
 */
export const getIndustryStocks = async (industryName) => {
  try {
    const response = await api.get(`/market/industry-stocks/${industryName}`);
    return response;
  } catch (error) {
    console.error(`获取行业(${industryName})相关个股数据失败:`, error);
    throw error;
  }
};

/**
 * 获取概念板块相关个股数据
 * @param {string} conceptName 概念名称
 * @returns {Promise<Array>} 概念相关个股数据列表
 */
export const getConceptStocks = async (conceptName) => {
  try {
    const response = await api.get(`/market/concept-stocks/${conceptName}`);
    return response;
  } catch (error) {
    console.error(`获取概念(${conceptName})相关个股数据失败:`, error);
    throw error;
  }
};