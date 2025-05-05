/**
 * 文档列表组件
 * 展示docs目录下的所有md文档
 * Authors: hovi.hyw & AI
 * Date: 2025-03-18
 */

import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Spin, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { getDocsList } from '../services/docsService';

const { Title } = Typography;

/**
 * 文档列表组件
 * @param {Object} props 组件属性
 * @param {Function} props.onSelectDoc 选择文档时的回调函数
 * @returns {JSX.Element} 文档列表组件
 */
const DocsList = ({ onSelectDoc }) => {
  // 文档列表数据
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 加载文档列表
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const docsList = await getDocsList();
        setDocs(docsList);
        setError(null);
      } catch (err) {
        console.error('加载文档列表失败:', err);
        setError('无法加载文档列表，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocs();
  }, []);

  return (
    <div className="docs-list">
      <Card>
        <Title level={2}>使用帮助文档</Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert type="error" message={error} />
        ) : docs.length === 0 ? (
          <Alert type="info" message="未找到文档文件，请确认public/docs目录中包含.md文件" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={docs}
            renderItem={(item) => (
              <List.Item style={{ cursor: 'pointer' }} onClick={() => onSelectDoc && onSelectDoc(item.path)}>
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: '24px' }} />}
                  title={<span>{item.name}</span>}
                  description={`文档路径: ${item.path}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default DocsList;