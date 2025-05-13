// frontend/src/pages/StockPage.js
/**
 * 股票列表页面组件
 * 展示股票列表和相关功能
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Typography } from 'antd';
import StockList from '../components/stock/StockList';

const { Title } = Typography;

/**
 * 股票列表页面组件
 * @returns {JSX.Element} 股票列表页面组件
 */
const StockPage = () => {
  return (
    <div className="stock-page">
      <div className="page-header">
        <Title level={2}>股票市场</Title>
        <p>查看和分析股票市场数据，获取实时行情信息</p>
      </div>
      <div className="page-content">
        <StockList />
      </div>
    </div>
  );
};

export default StockPage;