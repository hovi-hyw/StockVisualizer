// frontend/src/pages/DetailPage.js
/**
 * 通用详情页面，用于显示股票或指数的K线图。
 * 根据路由参数 `type` 和 `symbol` 区分股票和指数。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message, Button } from 'antd'; // 确认引入了 Button
import KLineChart from '../components/KLineChart';
import { getStockKline, getStockInfo } from '../services/stockService';
import { getIndexKline, getIndexInfo } from '../services/indexService';

const DetailPage = () => {
  const { type, symbol } = useParams();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [klineData, setKlineData] = useState(null);
  // 确认添加了这两个状态
  const [showRealChangeChart, setShowRealChangeChart] = useState(false);
  const [showComparativeChangeChart, setShowComparativeChangeChart] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 确认重置了状态
      setShowRealChangeChart(false);
      setShowComparativeChangeChart(false);
      try {
        let infoResponse, klineResponse;

        if (type === 'stock') {
          infoResponse = await getStockInfo(symbol);
          klineResponse = await getStockKline(symbol);
        } else if (type === 'index') {
          infoResponse = await getIndexInfo(symbol);
          klineResponse = await getIndexKline(symbol);
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

  // 确认添加了这两个处理函数
  const toggleRealChangeChart = () => {
    setShowRealChangeChart(prev => !prev);
  };

  const toggleComparativeChangeChart = () => {
    setShowComparativeChangeChart(prev => !prev);
  };


  if (loading) {
    return <Spin size="large" className="page-loading" />;
  }

  return (
    <div>
      <h2>{info?.name} ({symbol}) K线图</h2>
      <KLineChart data={klineData} title={`${info?.name} (${symbol}) K线图`} />

      {/* 确认添加了按钮 */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Button
          type={showRealChangeChart ? "primary" : "default"}
          onClick={toggleRealChangeChart}
          style={{ marginRight: '10px' }}
        >
          真实涨跌
        </Button>
        <Button
          type={showComparativeChangeChart ? "primary" : "default"}
          onClick={toggleComparativeChangeChart}
        >
          对比涨跌
        </Button>
      </div>

      {/* 确认添加了条件渲染的图表占位符 */}
      {showRealChangeChart && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '10px' }}>
          <h3>真实涨跌图</h3>
          <p>这里是“真实涨跌”图表的位置。</p>
        </div>
      )}

      {showComparativeChangeChart && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '10px' }}>
          <h3>对比涨跌图</h3>
          <p>这里是“对比涨跌”图表的位置。</p>
        </div>
      )}
    </div>
  );
};

export default DetailPage;