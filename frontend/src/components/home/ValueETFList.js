// frontend/src/components/ValueETFList.js
/**
 * 价值ETF列表组件
 * 展示价值型ETF基金及其相关数据
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 */

import { FallOutlined, FundOutlined, QuestionCircleOutlined, RiseOutlined } from '@ant-design/icons';
import { Card, List, Select, Space, Spin, Table, Tag, Tooltip, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getValueETFs } from '../../services/fundService';

const { Title, Text } = Typography;

/**
 * 价值ETF列表组件
 * @param {Object} props 组件属性
 * @param {Array} props.etfList ETF列表数据
 * @param {boolean} props.loading 加载状态
 * @param {string} props.error 错误信息
 * @returns {JSX.Element} 价值ETF列表组件
 */
const ValueETFList = () => {
  // 状态定义
  const [etfList, setEtfList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 检查是否在交易时间内（9:00-16:00）
  const isTradeTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;

    // 交易时间：9:00-16:00
    return currentTime >= 900 && currentTime <= 1600;
  };

  // 状态定义 - 排序相关
  const [sortBy, setSortBy] = useState('change');
  const [sortOrder, setSortOrder] = useState('desc');

  // 获取价值ETF数据
  useEffect(() => {
    const fetchValueETFs = async () => {
      try {
        setLoading(true);
        const data = await getValueETFs({
          sort_by: sortBy,
          sort_order: sortOrder
        });
        if (data && Array.isArray(data)) {
          setEtfList(data);
        }
        setError(null);
      } catch (err) {
        console.error('获取价值ETF数据失败:', err);
        setError('获取价值ETF数据失败');
      } finally {
        setLoading(false);
      }
    };


    // 首次加载数据
    fetchValueETFs();

    // 设置定时刷新（每3分钟刷新一次）
    const intervalId = setInterval(() => {
      // 只在交易时间内更新数据
      if (isTradeTime()) {
        fetchValueETFs();
      }
    }, 3 * 60 * 1000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [sortBy, sortOrder]);

  // 根据涨跌幅返回不同颜色
  const getChangeColor = (change) => {
    // 确保change是字符串类型
    const changeStr = String(change || '0');
    // 将字符串转换为数字进行比较
    const value = parseFloat(changeStr.replace('%', '').replace('+', ''));
    // 保持涨跌颜色一致，不受主题影响
    return value >= 0 ? '#cf1322' : '#3f8600';
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/detail/etf/${record.code}`}>{text}</Link>
      ),
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (text) => text ? text.toFixed(2) : '-',
    },
    {
      title: '涨跌幅',
      dataIndex: 'change',
      key: 'change',
      sorter: (a, b) => {
        const aValue = parseFloat(a.change.replace('%', ''));
        const bValue = parseFloat(b.change.replace('%', ''));
        return aValue - bValue;
      },
      render: (text) => {
        const value = parseFloat(text.replace('%', ''));
        const color = value >= 0 ? '#cf1322' : '#3f8600';
        const icon = value >= 0 ? <RiseOutlined /> : <FallOutlined />;
        return <span style={{ color }}>{icon} {text}</span>;
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          <Title level={4}><FundOutlined /> 价值ETF</Title>
          <Tooltip
            title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0, color: '#fff' }}>价值型ETF基金通常投资于被认为价值被低估的股票，这些股票的市盈率、市净率等估值指标相对较低。</Typography.Paragraph>}
            placement="topRight"
            overlayStyle={{ maxWidth: '300px' }}
            overlayInnerStyle={{ backgroundColor: '#000', color: '#fff' }}
          >
            <QuestionCircleOutlined className="info-icon" />
          </Tooltip>
        </Space>
      }
      className="etf-card"
      bordered={false}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载ETF数据中..." />
        </div>
      ) : error ? (
        <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>
      ) : (
        <Table
          columns={columns}
          dataSource={etfList}
          rowKey="code"
          pagination={false}
          size="small"
          scroll={{ y: 500 }}
          onChange={(pagination, filters, sorter) => {
            if (sorter.field) {
              setSortBy(sorter.field);
              setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
            }
          }}
        />
      )}
    </Card>
  );
};

export default ValueETFList;