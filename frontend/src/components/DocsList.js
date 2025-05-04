/**
 * 文档列表组件
 * 展示docs目录下的所有md文档
 * Authors: hovi.hyw & AI
 * Date: 2025-03-18
 */

import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Spin } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * 文档列表组件
 * @param {Object} props 组件属性
 * @param {Function} props.onSelectDoc 选择文档时的回调函数
 * @returns {JSX.Element} 文档列表组件
 */
const DocsList = ({ onSelectDoc }) => {
  // 文档列表数据
  const [docs, setDocs] = useState([
    { name: 'README', path: '/docs/README.md' },
    { name: 'API文档', path: '/docs/api_documentation.md' },
    { name: '组件文档', path: '/docs/component_documentation.md' },
    { name: '数据库文档', path: '/docs/database_documentation.md' },
    { name: '部署指南', path: '/docs/deployment_guide.md' },
    { name: '开发环境指南', path: '/docs/dev_environment_guide.md' },
    { name: '开发者手册', path: '/docs/developer_manual.md' },
    { name: '环境配置指南', path: '/docs/env_config_guide.md' },
    { name: 'UI样式指南', path: '/docs/ui_style_guide.md' },
    { name: '用户手册', path: '/docs/user_manual.md' }
  ]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="docs-list">
      <Card>
        <Title level={2}>使用帮助文档</Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
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