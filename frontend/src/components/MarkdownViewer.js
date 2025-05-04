/**
 * Markdown查看器组件
 * 用于渲染Markdown格式的文档内容
 * Authors: hovi.hyw & AI
 * Date: 2025-03-18
 */

import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import './MarkdownViewer.css';

const { Title, Paragraph } = Typography;

/**
 * Markdown查看器组件
 * @param {Object} props 组件属性
 * @param {string} props.filePath 文档文件路径
 * @returns {JSX.Element} Markdown查看器组件
 */
const MarkdownViewer = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 当文件路径变化时加载文档内容
    if (filePath) {
      loadMarkdownContent(filePath);
    }
  }, [filePath]);

  /**
   * 加载Markdown文档内容
   * @param {string} path 文档路径
   */
  const loadMarkdownContent = async (path) => {
    setLoading(true);
    setError(null);
    
    try {
      // 处理文件路径，确保能正确加载
      // 如果路径以/docs/开头，则是相对于public目录的路径
      const fullPath = path.startsWith('/docs/') ? path : path;
      
      // 使用axios获取文档内容
      const response = await axios.get(fullPath);
      setContent(response.data);
    } catch (err) {
      console.error('加载文档失败:', err);
      setError(`无法加载文档内容: ${path}，请确认文件路径正确`);
    } finally {
      setLoading(false);
    }
  };

  // 使用ReactMarkdown渲染Markdown内容
  const renderMarkdown = (text) => {
    if (!text) return null;
    
    return (
      <div className="markdown-content" style={{ padding: '0 20px' }}>
        <ReactMarkdown>
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <Card className="markdown-viewer">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : content ? (
        renderMarkdown(content)
      ) : (
        <Alert type="info" message="请选择一个文档查看" />
      )}
    </Card>
  );
};

export default MarkdownViewer;