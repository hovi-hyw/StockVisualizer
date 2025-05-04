// frontend/src/services/marketDataService.js
/**
 * 此模块提供市场数据相关的服务。
 * 封装了获取市场热门行业、概念板块和市场资讯的方法。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-17
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