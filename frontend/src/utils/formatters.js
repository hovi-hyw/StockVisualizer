// frontend/src/utils/formatters.js
/**
 * 此模块提供数据格式化相关的工具函数。
 * 包括日期、数字等格式化功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

/**
 * 格式化日期
 * @param {string|Date} date - 日期对象或日期字符串
 * @param {string} format - 格式化模式，默认为'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  let result = format;
  result = result.replace('YYYY', year);
  result = result.replace('MM', month);
  result = result.replace('DD', day);

  return result;
};

/**
 * 格式化数字为货币格式
 * @param {number} value - 数值
 * @param {number} decimal - 小数位数，默认为2
 * @param {string} prefix - 前缀，默认为'¥'
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (value, decimal = 2, prefix = '¥') => {
  if (value === null || value === undefined) return '';

  return `${prefix}${parseFloat(value).toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * 格式化百分比数值
 * @param {number} value - 要格式化的数值（已经是百分比值，如4.39表示4.39%）
 * @param {number} [decimals=2] - 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  // 后端已传来准确的百分比值，不需要乘以100
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * 格式化大数字（如成交量）
 * @param {number} value - 数值
 * @returns {string} 格式化后的字符串
 */
export const formatLargeNumber = (value) => {
  if (value === null || value === undefined) return '';

  const num = parseFloat(value);

  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}亿`;
  } else if (num >= 10000) {
    return `${(num / 10000).toFixed(2)}万`;
  } else {
    return num.toString();
  }
};