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
import ETFKLineChart from '../components/ETFKLineChart';
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

                // 获取K线数据（K线数据中已包含对比涨跌所需的参考指数数据）
                // 不设置日期范围，获取全部数据
                const klineDataResponse = await getETFKline(symbol);
                setKlineData(klineDataResponse);
                console.log('ETF K线数据已请求，包含对比涨跌所需的参考指数数据');
                
                // 检查K线数据中是否包含参考指数数据
                if (klineDataResponse && klineDataResponse.data && klineDataResponse.data.length > 0) {
                    const firstItem = klineDataResponse.data[0];
                    if (!firstItem.reference_change_rate && !firstItem.reference_rate) {
                        console.warn('K线数据中缺少参考指数数据，请检查后端API实现');
                    }
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
                    {klineData && <ETFKLineChart data={klineData} title={`${etfInfo.name} K线图`} symbol={symbol} />}
                </>
            )}
        </div>
    );
};

export default ETFDetailPage;