// frontend/src/utils/helpers.js
/**
 * 此模块提供通用的辅助函数。
 * 包括数据处理、计算等功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

/**
 * 计算涨跌幅
 * @param {number} current - 当前价格
 * @param {number} previous - 前一价格
 * @returns {number} 涨跌幅百分比
 */
export const calculateChangePercent = (current, previous) => {
  if (!current || !previous) return 0;

  return (current - previous) / previous * 100;
};

/**
 * 判断价格涨跌方向
 * @param {number} current - 当前价格
 * @param {number} previous - 前一价格
 * @returns {string} 方向：'up', 'down', 或 'flat'
 */
export const getPriceDirection = (current, previous) => {
  if (!current || !previous) return 'flat';

  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'flat';
};

/**
 * 深度复制对象
 * @param {Object} obj - 要复制的对象
 * @returns {Object} 复制后的新对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 生成随机颜色
 * @returns {string} 随机颜色的十六进制代码
 */
export const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} Promise对象
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 格式化K线数据为ECharts所需格式
 * @param {Array} data - 原始K线数据
 * @returns {Object} 格式化后的数据
 */
export const formatKlineData = (data) => {
  if (!data || !Array.isArray(data)) return { dates: [], values: [] };

  const dates = [];
  const values = [];

  data.forEach(item => {
    dates.push(item.date);
    values.push([
      parseFloat(item.open),
      parseFloat(item.close),
      parseFloat(item.low),
      parseFloat(item.high),
      parseFloat(item.volume || 0)
    ]);
  });

  return { dates, values };
};