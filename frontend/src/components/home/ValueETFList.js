// frontend/src/components/ValueETFList.js
/**
 * 价值ETF列表组件
 * 展示价值型ETF基金及其相关数据
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 */

import { FallOutlined, FundOutlined, QuestionCircleOutlined, RiseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Card, List, Select, Space, Spin, Table, Tag, Tooltip, Typography, Button } from 'antd';
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
  // 原始ETF数据
  const [originalEtfList, setOriginalEtfList] = useState([]);

  // 前端排序函数
  const sortEtfData = (data, field, order) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // 处理涨跌幅的特殊情况
      if (field === 'change') {
        aValue = parseFloat(aValue.replace('%', ''));
        bValue = parseFloat(bValue.replace('%', ''));
      }
      
      // 确保值是数字
      aValue = isNaN(aValue) ? 0 : aValue;
      bValue = isNaN(bValue) ? 0 : bValue;
      
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  // 获取价值ETF数据
  useEffect(() => {
    const fetchValueETFs = async () => {
      try {
        setLoading(true);
        const data = await getValueETFs();
        if (data && Array.isArray(data)) {
          setOriginalEtfList(data);
          // 应用初始排序
          const sortedData = sortEtfData(data, sortBy, sortOrder);
          setEtfList(sortedData);
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

    // 设置定时刷新（每5分钟刷新一次）
    const intervalId = setInterval(() => {
      fetchValueETFs();
    }, 5 * 60 * 1000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);
  
  // 当排序条件变化时，在前端进行排序
  useEffect(() => {
    const sortedData = sortEtfData(originalEtfList, sortBy, sortOrder);
    setEtfList(sortedData);
  }, [sortBy, sortOrder, originalEtfList]);

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
      sorter: true,
      render: (text) => text ? text.toFixed(2) : '-',
    },
    {
      title: '涨跌幅',
      dataIndex: 'change',
      key: 'change',
      sorter: true,
      render: (text) => {
        const value = parseFloat(text.replace('%', ''));
        const color = value >= 0 ? '#cf1322' : '#3f8600';
        const icon = value >= 0 ? <RiseOutlined /> : <FallOutlined />;
        return <span style={{ color }}>{icon} {text}</span>;
      },
    },
  ];

  // 刷新数据函数
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getValueETFs();
      if (data && Array.isArray(data)) {
        setOriginalEtfList(data);
        // 应用当前排序
        const sortedData = sortEtfData(data, sortBy, sortOrder);
        setEtfList(sortedData);
      }
      setError(null);
    } catch (err) {
      console.error('刷新价值ETF数据失败:', err);
      setError('刷新价值ETF数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <Tooltip title="主动刷新，否则每5分钟刷新一次">
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              onClick={handleRefresh}
              loading={loading}
            />
          </Tooltip>
        </div>
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
              // 注意：这里不再发送API请求，而是在useEffect中监听sortBy和sortOrder的变化来进行前端排序
            }
          }}
        />
      )}
    </Card>
  );
};

export default ValueETFList;