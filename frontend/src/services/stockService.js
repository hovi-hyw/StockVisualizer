// frontend/src/services/stockService.js

import api from './api';

/**
 * 股票服务，提供获取股票列表、详情、K线数据和真实涨跌数据的方法。
 */
const stockService = {
  /**
   * 获取股票列表。
   * @param {Object} params - 查询参数
   * @param {string} [params.cursor] - 分页游标
   * @param {number} [params.page] - 页码
   * @param {number} [params.page_size=20] - 每页数量
   * @param {string} [params.search] - 搜索关键字
   * @returns {Promise<Object>} 股票列表和分页信息
   */
  getStockList: (params = {}) => {
    return api.get('/stocks', { params });
  },

  /**
   * 获取股票详情。
   * @param {string} symbol - 股票代码
   * @returns {Promise<Object>} 股票详情
   */
  getStockInfo: (symbol) => {
    return api.get(`/stocks/${symbol}`);
  },

  /**
   * 获取股票K线数据。
   * @param {string} symbol - 股票代码
   * @param {Object} params - 查询参数
   * @param {string} [params.start_date] - 开始日期，格式为YYYY-MM-DD
   * @param {string} [params.end_date] - 结束日期，格式为YYYY-MM-DD
   * @returns {Promise<Object>} 股票K线数据
   */
  getStockKline: (symbol, params = {}) => {
    return api.get(`/stocks/${symbol}/kline`, { params });
  },

  /**
   * 获取股票真实涨跌数据。
   * @param {string} symbol - 股票代码
   * @param {Object} params - 查询参数
   * @param {string} [params.start_date] - 开始日期，格式为YYYY-MM-DD
   * @param {string} [params.end_date] - 结束日期，格式为YYYY-MM-DD
   * @returns {Promise<Object>} 股票真实涨跌数据
   */
  getStockRealChange: (symbol, params = {}) => {
    return api.get(`/stocks/${symbol}/real-change`, { params });
  },

  /**
   * 获取热门个股数据。
   * @returns {Promise<Array>} 热门个股数据列表
   */
  getHotStocks: () => {
    return api.get('/stocks/hot-stocks');
  },

  /**
   * 获取个股资金流向数据。
   * @returns {Promise<Array>} 个股资金流向数据列表
   */
  getStockFunds: () => {
    return api.get('/stocks/stock-funds');
  },

  /**
   * 获取个股资金流数据。
   * @param {string} symbol - 股票代码
   * @returns {Promise<Object>} 个股资金流数据
   */
  getStockFundFlow: (symbol) => {
    return api.get(`/stocks/${symbol}/fund-flow`);
  }
};

// 导出默认对象
export default stockService;

// 同时导出各个方法，以支持命名导入
export const {
  getStockList,
  getStockInfo,
  getStockKline,
  getStockRealChange,
  getHotStocks,
  getStockFunds,
  getStockFundFlow
} = stockService;