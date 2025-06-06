// frontend/src/pages/IndexDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getIndexInfo, getIndexKline, getIndexChangeRate } from '../services/indexService'; // 引入 indexService
import IndexETFKLineChart from '../components/IndexETFKLineChart';
import { Typography, Alert, Spin } from 'antd';

const { Title } = Typography;

const IndexDetailPage = () => {
    const { symbol } = useParams();
    const [indexInfo, setIndexInfo] = useState(null);
    const [klineData, setKlineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 获取指数信息
                const indexInfoResponse = await getIndexInfo(symbol);
                setIndexInfo(indexInfoResponse);

                // 获取K线数据
                // 不设置日期范围，获取全部数据
                const klineDataResponse = await getIndexKline(symbol);
                setKlineData(klineDataResponse);
                
                // 获取指数对比涨跌数据
                try {
                    // 不设置日期范围，获取全部对比涨跌数据
                    await getIndexChangeRate(symbol);
                    console.log('指数对比涨跌数据已请求');
                } catch (compareErr) {
                    console.warn('获取指数对比涨跌数据失败，但不影响K线图显示:', compareErr);
                }
            } catch (err) {
                setError(err.message || '获取数据失败');
                console.error('获取指数详情或K线数据失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol]);

    return (
        <div className="index-detail-page">
            {loading && <Spin size="large" className="page-loading" />}
            {error && <Alert message="错误" description={error} type="error" showIcon />}
            {indexInfo && (
                <>
                    <Title level={2}>{indexInfo.name} ({indexInfo.symbol})</Title>
                    {klineData && <IndexETFKLineChart data={klineData} title={`${indexInfo.name} K线图`} symbol={symbol} type="index" />}
                </>
            )}
        </div>
    );
};

export default IndexDetailPage;