// frontend/src/components/Footer.js
/**
 * 此组件用于展示应用的底部信息栏。
 * 显示版权信息和其他相关链接。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

/**
 * 底部信息栏组件
 * @returns {JSX.Element} 底部信息栏组件
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        <p>股票数据可视化系统 &copy; {currentYear}</p>
        <p>
          <a href="#">关于我们</a> | 
          <a href="#">使用帮助</a> | 
          <a href="#">数据来源</a>
        </p>
      </div>
    </AntFooter>
  );
};

export default Footer;