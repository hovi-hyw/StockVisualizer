// frontend/src/components/IndexList.js
import React, { useState, useEffect } from 'react';
import { Table, Input, message } from 'antd';
import { getIndexList } from '../services/indexService';

const { Search } = Input;

const IndexList = () => {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [search, setSearch] = useState('');

  const fetchIndices = async (page = 1, pageSize = 20, searchValue = '') => {
    setLoading(true);
    try {
      const response = await getIndexList({
        page,
        page_size: pageSize,
        search: searchValue,
      });

      setIndices(response.items || []);
      setPagination({
        current: response.page,
        pageSize: response.page_size,
        total: response.total,
      });
    } catch (error) {
      message.error('获取指数列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndices(pagination.current, pagination.pageSize, search);
  }, []);

  const handleTableChange = (pagination) => {
    fetchIndices(pagination.current, pagination.pageSize, search);
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchIndices(1, pagination.pageSize, value);
  };

  const columns = [
    {
      title: '指数代码',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '指数名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '最新价',
      dataIndex: 'latest_price',
      key: 'latest_price',
      render: (text) => text ? text.toFixed(2) : '-',
    },
  ];

  return (
    <div className="index-list">
      <div className="list-header">
        <Search
          placeholder="搜索指数代码或名称"
          onSearch={handleSearch}
          style={{ width: 300, marginBottom: 16 }}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={indices}
        rowKey="symbol"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default IndexList;