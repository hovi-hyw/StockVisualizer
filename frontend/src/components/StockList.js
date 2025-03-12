// frontend/src/components/StockList.js
/**
 * 此组件用于展示股票列表。
 * 提供股票数据的表格展示、搜索和分页功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Tag, Button, message } from 'antd';
import { SearchOutlined, LineChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getStockList } from '../services/stockService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getPriceDirection } from '../utils/helpers';

const { Search } = Input;

/**
 * 股票列表组件
 * @returns {JSX.Element} 股票列表组件
 */
const StockList = () => {
  // 状态定义
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');

  // 获取股票列表数据
  const fetchStockList = async (page = 1, pageSize = 20, search = '') => {
    setLoading(true);
    try {
      const response = await getStockList({
        page,
        page_size: pageSize,
        search,
      });

      setStockData(response.items);
      setPagination({
        current: page,
        pageSize,
        total: response.total,
      });
    } catch (error) {
      message.error('获取股票列表失败');
      console.error('获取股票列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchStockList();
  }, []);

  // 处理表格变化（分页、排序等）
  const handleTableChange = (pagination) => {
    fetchStockList(pagination.current, pagination.pageSize, searchText);
  };

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
    fetchStockList(1, pagination.pageSize, value);
  };

  // 表格列定义
  const columns = [
    {
      title: '股票代码',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Link to={`/detail/stock/${text}`}>{text}</Link>,
    },
    {
      title: '股票名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '最新价',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (text) => formatCurrency(text, 2, ''),
      sorter: (a, b) => a.current_price - b.current_price,
    },
    {
      title: '涨跌幅',
      dataIndex: 'change_percent',
      key: 'change_percent',
      render: (text, record) => {
        const direction = getPriceDirection(record.current_price, record.prev_close_price);
        const color = direction === 'up' ? 'red' : direction === 'down' ? 'green' : '';
        return <Tag color={color}>{formatPercent(text)}</Tag>;
      },
      sorter: (a, b) => a.change_percent - b.change_percent,
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
      render: (text) => formatCurrency(text, 0, ''),
      sorter: (a, b) => a.volume - b.volume,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<LineChartOutlined />} 
            size="small"
            onClick={() => window.location.href = `/detail/stock/${record.symbol}`}
          >
            K线图
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="stock-list-container">
      <div className="stock-list-header">
        <h2>股票列表</h2>
        <Search
          placeholder="输入股票代码搜索"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ width: 300, marginBottom: 16 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={stockData}
        rowKey="symbol"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default StockList;