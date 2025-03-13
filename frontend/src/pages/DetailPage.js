// frontend/src/pages/DetailPage.js
/**
 * 通用详情页面，用于显示股票或指数的K线图。
 * 根据路由参数 `type` 和 `symbol` 区分股票和指数。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import KLineChart from '../components/KLineChart';
import { getStockKline, getStockInfo } from '../services/stockService';
import { getIndexKline, getIndexInfo } from '../services/indexService';

const DetailPage = () => {
  const { type, symbol } = useParams(); // 从路由参数获取 type 和 symbol
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [klineData, setKlineData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let infoResponse, klineResponse;

        if (type === 'stock') {
          infoResponse = await getStockInfo(symbol);
          klineResponse = await getStockKline(symbol, { start_date: '2023-01-01', end_date: '2025-01-01' });
        } else if (type === 'index') {
          infoResponse = await getIndexInfo(symbol);
          klineResponse = await getIndexKline(symbol, { start_date: '2023-01-01', end_date: '2025-01-01' });
        }

        setInfo(infoResponse);
        setKlineData(klineResponse);
      } catch (error) {
        message.error(`获取${type === 'stock' ? '股票' : '指数'}数据失败`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, symbol]);

  if (loading) {
    return <Spin size="large" className="page-loading" />;
  }

  return (
    <div>
      <h2>{info?.name} ({symbol}) K线图</h2>
      <KLineChart data={klineData} title={`${info?.name} (${symbol}) K线图`} />
    </div>
  );
};

export default DetailPage;