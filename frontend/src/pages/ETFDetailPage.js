// frontend/src/pages/ETFDetailPage.js
/**
 * 此组件用于展示ETF详情页面。
 * 提供ETF K线图展示功能。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-28
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getETFInfo, getETFKline, getETFComparativeChange } from '../services/etfService'; // 引入 etfService
import IndexETFKLineChart from '../components/IndexETFKLineChart';
import { Typography, Alert, Spin } from 'antd';

const { Title } = Typography;

const ETFDetailPage = () => {
    const { symbol } = useParams();
    const [etfInfo, setETFInfo] = useState(null);
    const [klineData, setKlineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 获取ETF信息
                const etfInfoResponse = await getETFInfo(symbol);
                setETFInfo(etfInfoResponse);

                // 获取K线数据
                const klineDataResponse = await getETFKline(symbol, {
                    start_date: '2024-01-01', // 可以根据需要调整
                    end_date: '2025-03-12', // 可以根据需要调整
                });
                setKlineData(klineDataResponse);
                
                // 获取对比涨跌数据
                try {
                    // 使用相同的日期范围获取对比涨跌数据
                    await getETFComparativeChange(symbol, {
                        start_date: '2024-01-01',
                        end_date: '2025-03-12',
                    });
                    console.log('ETF对比涨跌数据已请求');
                } catch (compareErr) {
                    console.warn('获取ETF对比涨跌数据失败，但不影响K线图显示:', compareErr);
                }
            } catch (err) {
                setError(err.message || '获取数据失败');
                console.error('获取ETF详情或K线数据失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol]);

    return (
        <div className="etf-detail-page">
            {loading && <Spin size="large" className="page-loading" />}
            {error && <Alert message="错误" description={error} type="error" showIcon />}
            {etfInfo && (
                <>
                    <Title level={2}>{etfInfo.name} ({etfInfo.symbol})</Title>
                    {klineData && <IndexETFKLineChart data={klineData} title={`${etfInfo.name} K线图`} symbol={symbol} type="etf" />}
                </>
            )}
        </div>
    );
};

export default ETFDetailPage;