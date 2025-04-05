// frontend/src/components/StockList.js
/**
 * 此组件用于展示股票列表。
 * 提供股票数据的表格展示、搜索和分页功能。
 * 包含性能优化：数据缓存、请求超时处理、加载状态优化等
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Input, Space, Tag, Button, message, Alert, Spin, Progress } from 'antd';
import { SearchOutlined, LineChartOutlined, ReloadOutlined } from '@ant-design/icons';
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
  const [loadingProgress, setLoadingProgress] = useState(0); // 加载进度
  const [stockData, setStockData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,  // 当前页码
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  
  // 数据缓存 - 使用useRef避免重渲染
  const dataCache = useRef(new Map());
  const abortControllerRef = useRef(null); // 用于取消请求
  const retryCount = useRef(0); // 重试计数器

  // 生成缓存键
  const getCacheKey = (page, pageSize, search) => {
    return `${page}_${pageSize}_${search}`;
  };

  // 获取股票列表数据 - 使用useCallback优化性能
  const fetchStockList = useCallback(async (params = {}) => {
    // 取消之前的请求（如果存在）
    if (abortControllerRef.current) {
      console.log('取消之前的请求');
      abortControllerRef.current.abort();
    }
    
    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setLoadingProgress(10); // 初始进度
    setError(null);
    
    // 确保参数格式正确
    const { page, pageSize = 20, search = '' } = params;
    const cacheKey = getCacheKey(page, pageSize, search);
    
    // 检查缓存中是否有数据
    if (dataCache.current.has(cacheKey)) {
      console.log('使用缓存数据:', cacheKey);
      const cachedData = dataCache.current.get(cacheKey);
      setStockData(cachedData.items);
      setPagination({
        current: cachedData.current_page,
        pageSize,
        total: cachedData.total || 0
      });
      setLoading(false);
      return;
    }
    
    try {
      setLoadingProgress(30); // 请求开始
      
      const apiParams = {
        page_size: pageSize,
        search,
        page: page || 1, // 确保始终传递页码参数
        signal: abortControllerRef.current.signal // 添加取消信号
      };
      
      // 模拟进度增加
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      console.log(`发起API请求: 页码=${page}, 每页数量=${pageSize}, 搜索=${search}`);
      const response = await getStockList(apiParams);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      console.log('获取到的股票列表数据:', response);
      
      if (response && response.items) {
        // 缓存数据 - 只缓存前10页数据，避免内存占用过多
        if (page <= 10) {
          dataCache.current.set(cacheKey, response);
          // 限制缓存大小，最多保留20条缓存
          if (dataCache.current.size > 20) {
            const firstKey = dataCache.current.keys().next().value;
            dataCache.current.delete(firstKey);
          }
        }
        
        setStockData(response.items);
        // 确保从API响应中获取当前页码并更新分页状态
        const currentPage = response.current_page || page || 1;
        setPagination({
          current: currentPage,
          pageSize,
          total: response.total || 0
        });
        
        // 重置重试计数
        retryCount.current = 0;
      } else {
        setError('返回的数据格式不正确');
        console.error('返回的数据格式不正确:', response);
      }
    } catch (error) {
      // 忽略取消请求的错误
      if (error.name === 'AbortError' || error.message === 'canceled') {
        console.log('请求已取消，不显示错误');
        return;
      }
      
      const errorMessage = error.message || '获取股票列表失败';
      setError(errorMessage);
      
      // 对于大页码查询，自动重试
      if (page > 5 && retryCount.current < 2) {
        retryCount.current += 1;
        message.warning(`第${page}页数据加载失败，正在重试(${retryCount.current}/2)...`);
        setTimeout(() => {
          fetchStockList(params);
        }, 2000); // 2秒后重试
        return;
      }
      
      message.error(errorMessage);
      console.error('获取股票列表失败:', error);
    } finally {
      if (retryCount.current === 0) { // 只有在不是重试状态时才关闭加载
        setLoading(false);
      }
    }
  }, []);

  // 初始加载数据
      useEffect(() => {
        // 使用一个标志变量来标记是否是组件的首次渲染
        const isFirstRender = pagination.current === 1 && stockData.length === 0;
        
        // 只有在首次渲染时才自动加载数据，避免与Table的onChange事件冲突
        if (isFirstRender) {
          console.log('组件首次渲染，加载初始数据');
          fetchStockList({ page: 1 });
        }
        
        // 组件卸载时取消请求
        return () => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        };
      }, [fetchStockList]);
      
      // 移除对pagination.current和stockData.length的依赖，避免不必要的重新加载
  // 处理表格变化（仅处理排序等，分页由pagination.onChange处理）
  const handleTableChange = (paginationInfo, filters, sorter) => {
    // 处理排序
    if (sorter && sorter.order) {
      // 排序时重置页码，从头开始
      fetchStockList({
        page: 1,
        pageSize: paginationInfo.pageSize,
        search: searchText
      });
      return;
    }
    
    // 不在这里处理分页，避免重复请求
    // 分页由Table组件的pagination.onChange属性处理
  };
  
  // 跳转到指定页面
  const jumpToPage = async (targetPage, pageSize = pagination.pageSize) => {
    if (targetPage <= 0) {
      message.error('页码必须大于0');
      return;
    }
    
    // 大页码警告
    if (targetPage > 50) {
      message.warning('大页码查询可能需要较长时间，请耐心等待');
    }
    
    try {
      // 直接使用页码进行分页
      await fetchStockList({
        page: targetPage,
        pageSize: pageSize,
        search: searchText
      });
    } catch (error) {
      console.error('跳转页面失败:', error);
      message.error('跳转页面失败');
    }
  };
  
  // 清除缓存并重新加载数据
  const clearCacheAndReload = () => {
    dataCache.current.clear();
    message.success('缓存已清除，重新加载数据');
    fetchStockList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      search: searchText
    });
  };
  
  // 不需要额外的useEffect来跟踪页码，因为我们直接使用API响应中的页码

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
    fetchStockList({
      page: 1, // 搜索时重置到第一页
      pageSize: pagination.pageSize,
      search: value
    });
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
      render: (text) => text ? formatCurrency(text, 2, '') : '-',
      sorter: (a, b) => a.current_price - b.current_price,
    },
    {
      title: '涨跌幅',
      dataIndex: 'change_percent',
      key: 'change_percent',
      render: (text, record) => {
        if (!text && text !== 0) return '-';
        const direction = getPriceDirection(record.current_price, record.prev_close_price);
        const color = direction === 'up' ? 'red' : direction === 'down' ? 'green' : '';
        // 使用formatPercent函数直接格式化，不做额外处理
        return <Tag color={color}>{formatPercent(text)}</Tag>;
      },
      sorter: (a, b) => a.change_percent - b.change_percent,
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
      render: (text) => text ? formatCurrency(text, 0, '') : '-',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Search
            placeholder="输入股票代码搜索"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300, marginBottom: 16 }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={clearCacheAndReload}
            title="清除缓存并刷新"
          >
            刷新
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert 
          message="获取数据错误" 
          description={error}
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" danger onClick={() => fetchStockList({
              page: pagination.current,
              pageSize: pagination.pageSize,
              search: searchText
            })}>
              重试
            </Button>
          }
        />
      )}
      
      {loading && loadingProgress < 100 && (
        <div style={{ marginBottom: 16 }}>
          <Progress percent={loadingProgress} status="active" />
          <div style={{ textAlign: 'center', color: '#1890ff' }}>
            {loadingProgress < 30 ? '准备加载数据...' : 
             loadingProgress < 60 ? '正在查询数据库...' : 
             loadingProgress < 90 ? '正在处理数据...' : '即将完成...'}
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {pagination.total > 0 && (
            <span>共 {pagination.total} 条记录，当前第 {pagination.current} 页</span>
          )}
        </div>
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
              const input = document.querySelector('input[type="number"]');
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
        dataSource={stockData}
        rowKey="symbol"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          showQuickJumper: true, // 添加快速跳转输入框
          onChange: (page, pageSize) => {
            // 直接在onChange事件中处理分页，确保页码变化时调用API
            fetchStockList({
              page: page,
              pageSize: pageSize,
              search: searchText
            });
          }
        }}
        loading={loading && loadingProgress < 100} // 只在加载进度小于100时显示加载状态
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: loading ? <Spin tip="加载中..."/> : '暂无数据'
        }}
      />
    </div>
  );
};

export default StockList;