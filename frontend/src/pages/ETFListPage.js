// frontend/src/pages/ETFListPage.js
/**
 * 此组件用于展示ETF列表页面。
 * 提供ETF列表浏览和搜索功能。
 * 支持标准ETF列表和高成交额高振幅ETF列表的切换。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-28
 * 更新: 2025-04-01 - 添加高成交额高振幅ETF列表标签页
 */

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Typography, Spin, Alert, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getETFList, getHighVolumeETFList } from '../services/etfService';
import { formatLargeNumber } from '../utils/formatters';

const { Title } = Typography;
const { TabPane } = Tabs;

/**
 * ETF列表页面组件
 * @returns {JSX.Element} ETF列表页面组件
 */
const ETFListPage = () => {
    // 标准ETF列表状态
    const [etfList, setETFList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    
    // 高成交额高振幅ETF列表状态
    const [highVolumeETFList, setHighVolumeETFList] = useState([]);
    const [highVolumeLoading, setHighVolumeLoading] = useState(true);
    const [highVolumeError, setHighVolumeError] = useState(null);
    const [highVolumeSearchText, setHighVolumeSearchText] = useState('');
    const [highVolumePagination, setHighVolumePagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    
    // 当前激活的标签页
    const [activeTab, setActiveTab] = useState('1');

    // 获取标准ETF列表数据
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
                    current: page,
                    pageSize: pageSize,
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
    
    // 获取高成交额高振幅ETF列表数据
    const fetchHighVolumeETFList = async (page = 1, pageSize = 10, search = '') => {
        setHighVolumeLoading(true);
        try {
            const response = await getHighVolumeETFList({
                page,
                page_size: pageSize,
                search
            });
            
            if (response) {
                setHighVolumeETFList(response.items || []);
                setHighVolumePagination({
                    current: page,
                    pageSize: pageSize,
                    total: response.total || 0
                });
            }
        } catch (err) {
            console.error('获取高成交额高振幅ETF列表失败:', err);
            setHighVolumeError('获取高成交额高振幅ETF列表失败，请稍后重试');
        } finally {
            setHighVolumeLoading(false);
        }
    };

    // 初始加载
    useEffect(() => {
        // 加载标准ETF列表
        fetchETFList(pagination.current, pagination.pageSize);
        
        // 加载高成交额高振幅ETF列表
        fetchHighVolumeETFList(highVolumePagination.current, highVolumePagination.pageSize);
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

    // 处理标准ETF表格变化（分页、排序等）
    const handleTableChange = (paginationInfo) => {
        setPagination(paginationInfo);
        fetchETFList(paginationInfo.current, paginationInfo.pageSize, searchText);
    };

    // 处理标准ETF搜索
    const handleSearch = () => {
        fetchETFList(1, pagination.pageSize, searchText);
    };
    
    // 处理高成交额高振幅ETF表格变化（分页、排序等）
    const handleHighVolumeTableChange = (paginationInfo) => {
        setHighVolumePagination(paginationInfo);
        fetchHighVolumeETFList(paginationInfo.current, paginationInfo.pageSize, highVolumeSearchText);
    };

    // 处理高成交额高振幅ETF搜索
    const handleHighVolumeSearch = () => {
        fetchHighVolumeETFList(1, highVolumePagination.pageSize, highVolumeSearchText);
    };
    
    // 处理标签页切换
    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    return (
        <div className="etf-list-page">
            <Title level={2}>ETF列表</Title>
            
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="标准ETF列表" key="1">
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
                </TabPane>
                
                <TabPane tab="高成交额高振幅ETF列表" key="2">
                    <Space style={{ marginBottom: 16 }}>
                        <Input
                            placeholder="搜索ETF代码或名称"
                            value={highVolumeSearchText}
                            onChange={e => setHighVolumeSearchText(e.target.value)}
                            onPressEnter={handleHighVolumeSearch}
                            style={{ width: 200 }}
                        />
                        <Button 
                            type="primary" 
                            icon={<SearchOutlined />} 
                            onClick={handleHighVolumeSearch}
                        >
                            搜索
                        </Button>
                    </Space>
                    
                    {highVolumeError && <Alert message={highVolumeError} type="error" showIcon style={{ marginBottom: 16 }} />}
                    
                    <Spin spinning={highVolumeLoading}>
                        <Table
                            columns={[
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
                                    render: (text) => text ? text.toFixed(2) : '-',
                                    sorter: (a, b) => a.latest_price - b.latest_price
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
                                    },
                                    sorter: (a, b) => a.change_rate - b.change_rate
                                },
                                {
                                    title: '平均成交额(人民币)',
                                    dataIndex: 'avg_amount',
                                    key: 'avg_amount',
                                    render: (text) => text ? formatLargeNumber(text) : '-',
                                    sorter: (a, b) => a.avg_amount - b.avg_amount,
                                    defaultSortOrder: 'descend'
                                },
                                {
                                    title: '平均振幅(%)',
                                    dataIndex: 'avg_amplitude',
                                    key: 'avg_amplitude',
                                    render: (text) => text ? parseFloat(text).toFixed(2) : '-',
                                    sorter: (a, b) => a.avg_amplitude - b.avg_amplitude
                                }
                            ]}

                            dataSource={highVolumeETFList}
                            rowKey="symbol"
                            pagination={highVolumePagination}
                            onChange={handleHighVolumeTableChange}
                        />
                    </Spin>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ETFListPage;