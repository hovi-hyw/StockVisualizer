// frontend/src/pages/IndexPage.js
/**
 * 指数列表页面组件
 * 展示市场指数数据和相关功能
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Typography } from 'antd';
import IndexList from '../components/IndexList';

const { Title } = Typography;

/**
 * 指数列表页面组件
 * @returns {JSX.Element} 指数列表页面组件
 */
const IndexPage = () => {
  return (
    <div className="index-page">
      <div className="page-header">
        <Title level={2}>市场指数</Title>
        <p>查看主要市场指数数据，把握市场动向</p>
      </div>
      <div className="page-content">
        <IndexList />
      </div>
    </div>
  );
};

export default IndexPage;