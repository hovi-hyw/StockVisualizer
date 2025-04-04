// frontend/src/components/IndexList.js
import React, { useState, useEffect } from 'react';
import { Table, Input, message, Button, Space, Alert } from 'antd';
import { LineChartOutlined, SearchOutlined } from '@ant-design/icons';
import { getIndexList } from '../services/indexService';

const { Search } = Input;

const IndexList = () => {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,  // 虚拟页码，用于UI显示
    pageSize: 20,
    total: 0,
    nextCursor: null,
    prevCursor: null,
  });
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);

  const fetchIndices = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getIndexList(params);

      console.log('获取到的指数列表数据:', response);
      
      if (response && response.items) {
        setIndices(response.items);
        setPagination({
          current: params.page || 1, // 设置当前页码
          pageSize: params.page_size || 20,
          total: response.total || 0,
          nextCursor: response.next_cursor || null,
          prevCursor: response.prev_cursor || null,
        });
      } else {
        setError('返回的数据格式不正确');
        console.error('返回的数据格式不正确:', response);
      }
    } catch (error) {
      const errorMessage = error.message || '获取指数列表失败';
      setError(errorMessage);
      message.error(errorMessage);
      console.error('获取指数列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchIndices({
      page: 1,
      page_size: 20
    });
  }, []);

  // 处理表格变化（分页、排序等）
  const handleTableChange = (paginationInfo, filters, sorter) => {
    // 处理排序
    if (sorter && sorter.order) {
      // 排序时重置页码，从头开始
      fetchIndices({
        page: 1,
        page_size: paginationInfo.pageSize,
        search: searchText
      });
      return;
    }
    
    // 处理分页 - 直接使用页码进行分页
    const { current } = paginationInfo;
    
    fetchIndices({
      page: current,
      page_size: paginationInfo.pageSize,
      search: searchText
    });
  };
  
  // 跳转到指定页面
  const jumpToPage = async (targetPage, pageSize = pagination.pageSize) => {
    if (targetPage <= 0) {
      message.error('页码必须大于0');
      return;
    }
    
    setLoading(true);
    
    try {
      // 直接使用页码进行分页
      await fetchIndices({
        page: targetPage,
        page_size: pageSize,
        search: searchText
      });
    } catch (error) {
      console.error('跳转页面失败:', error);
      message.error('跳转页面失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 跟踪当前页码（虽然使用游标分页，但仍需维护一个虚拟的页码用于UI显示）
  useEffect(() => {
    if (pagination.nextCursor || pagination.prevCursor) {
      setPagination(prev => ({
        ...prev,
        current: prev.current || 1
      }));
    } else {
      setPagination(prev => ({
        ...prev,
        current: 1
      }));
    }
  }, [pagination.nextCursor, pagination.prevCursor]);

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
    fetchIndices({
      page: 1, // 搜索时重置到第一页
      page_size: pagination.pageSize,
      search: value
    });
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
      render: (text) => (text ? text.toFixed(2) : '-'),
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
            onClick={() => window.location.href = `/detail/index/${record.symbol}`}
          >
            K线图
          </Button>
        </Space>
      ),
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <span>跳转到：</span>
          <Input
            type="number"
            min={1}
            style={{ width: 60 }}
            onPressEnter={(e) => {
              const page = parseInt(e.target.value);
              if (!isNaN(page)) {
                jumpToPage(page);
              }
            }}
          />
          <span>页</span>
          <Button 
            type="primary"
            onClick={() => {
              const input = document.querySelector('.index-list input[type="number"]');
              const page = parseInt(input.value);
              if (!isNaN(page)) {
                jumpToPage(page);
              }
            }}
          >
            跳转
          </Button>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={indices}
        rowKey="symbol"
        pagination={{
          current: pagination.current || 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true, // 启用快速跳转功能
          // 显示总记录数
          showTotal: (total) => `共 ${total} 条记录`
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default IndexList;