/**
 * 文档列表页面
 * 展示docs目录下的所有md文档
 * Authors: hovi.hyw & AI
 * Date: 2025-03-18
 */

import React, { useState } from 'react';
import { Typography, Breadcrumb, Row, Col } from 'antd';
import { HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import DocsList from '../components/DocsList';
import MarkdownViewer from '../components/MarkdownViewer';

const { Title, Paragraph } = Typography;

/**
 * 文档列表页面
 * @returns {JSX.Element} 文档列表页面
 */
const DocsPage = () => {
  // 当前选中的文档路径
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  /**
   * 处理文档选择
   * @param {string} docPath 文档路径
   */
  const handleSelectDoc = (docPath) => {
    setSelectedDoc(docPath);
  };
  return (
    <div className="docs-page">
      {/* 面包屑导航 */}
      <Breadcrumb style={{ marginBottom: '20px' }}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <FileTextOutlined /> 使用帮助
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* 页面标题 */}
      <div className="page-header">
        <Title>使用帮助文档</Title>
        <Paragraph>
          这里提供了股票数据可视化系统的所有使用文档，包括用户手册、API文档、组件文档等，帮助您更好地使用本系统。
        </Paragraph>
      </div>
      
      {/* 文档内容区域 */}
      <div className="docs-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6}>
            {/* 文档列表 */}
            <DocsList onSelectDoc={handleSelectDoc} />
          </Col>
          <Col xs={24} md={16} lg={18}>
            {/* Markdown查看器 */}
            <MarkdownViewer filePath={selectedDoc} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DocsPage;