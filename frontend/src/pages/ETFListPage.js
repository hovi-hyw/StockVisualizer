// frontend/src/pages/ETFListPage.js
/**
 * 此组件用于展示ETF列表页面。
 * 提供ETF列表浏览和搜索功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-28
 */

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Typography, Spin, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getETFList } from '../services/etfService';

const { Title } = Typography;

/**
 * ETF列表页面组件
 * @returns {JSX.Element} ETF列表页面组件
 */
const ETFListPage = () => {
    const [etfList, setETFList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // 获取ETF列表数据
    const fetchETFList = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            const response = await getETFList({
                page,
                page_size: pageSize,
                search
            });
            
            if (response) {
                setETFList(response.items || []);
                setPagination({
                    ...pagination,
                    current: page,
                    total: response.total || 0
                });
            }
        } catch (err) {
            console.error('获取ETF列表失败:', err);
            setError('获取ETF列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 初始加载
    useEffect(() => {
        fetchETFList(pagination.current, pagination.pageSize);
    }, []);

    // 表格列定义
    const columns = [
        {
            title: 'ETF代码',
            dataIndex: 'symbol',
            key: 'symbol',
            render: (text) => <Link to={`/detail/etf/${text}`}>{text}</Link>
        },
        {
            title: 'ETF名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '最新价',
            dataIndex: 'latest_price',
            key: 'latest_price',
            render: (text) => text ? text.toFixed(2) : '-'
        },
        {
            title: '涨跌幅',
            dataIndex: 'change_rate',
            key: 'change_rate',
            render: (text) => {
                if (!text && text !== 0) return '-';
                const value = parseFloat(text);
                const color = value >= 0 ? '#c23531' : '#3fbf67';
                return <span style={{ color }}>{value.toFixed(2)}%</span>;
            }
        },
        {
            title: '成交量(万)',
            dataIndex: 'volume',
            key: 'volume',
            render: (text) => text ? (text / 10000).toFixed(2) : '-'
        },
        {
            title: '成交额(万)',
            dataIndex: 'amount',
            key: 'amount',
            render: (text) => text ? (text / 10000).toFixed(2) : '-'
        }
    ];

    // 处理表格变化（分页、排序等）
    const handleTableChange = (pagination) => {
        fetchETFList(pagination.current, pagination.pageSize, searchText);
    };

    // 处理搜索
    const handleSearch = () => {
        fetchETFList(1, pagination.pageSize, searchText);
    };

    return (
        <div className="etf-list-page">
            <Title level={2}>ETF列表</Title>
            
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="搜索ETF代码或名称"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 200 }}
                />
                <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                >
                    搜索
                </Button>
            </Space>
            
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
            
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={etfList}
                    rowKey="symbol"
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </Spin>
        </div>
    );
};

export default ETFListPage;