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
import StockKLineChart from '../components/StockKLineChart';
import IndexETFKLineChart from '../components/IndexETFKLineChart';
import { getStockKline, getStockInfo } from '../services/stockService';
import { getIndexKline, getIndexInfo } from '../services/indexService';

const DetailPage = () => {
  const { type, symbol } = useParams();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [klineData, setKlineData] = useState(null);
  // 修改为个股信息的状态
  const [showStockInfo, setShowStockInfo] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 重置个股信息状态
      setShowStockInfo(false);
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
        let typeText = '数据';
        if (type === 'stock') typeText = '股票';
        else if (type === 'index') typeText = '指数';
        
        message.error(`获取${typeText}数据失败`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, symbol]);

  // 个股信息的处理函数
  const toggleStockInfo = () => {
    setShowStockInfo(prev => !prev);
  };


  if (loading) {
    return <Spin size="large" className="page-loading" />;
  }

  return (
    <div>
      <h2>{info?.name} ({symbol}) K线图</h2>
      
      {/* 个股信息按钮 */}
      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Button
          type={showStockInfo ? "primary" : "default"}
          onClick={toggleStockInfo}
        >
          个股信息
        </Button>
      </div>
      
      {/* K线图 - 根据类型显示不同的子图表 */}
      {type === 'stock' ? (
        <StockKLineChart 
          data={klineData} 
          title={`${info?.name} (${symbol}) K线图`} 
          symbol={symbol}
        />
      ) : (
        <IndexETFKLineChart 
          data={klineData} 
          title={`${info?.name} (${symbol}) K线图`} 
          symbol={symbol}
          type={type}
        />
      )}

      {showStockInfo && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '10px' }}>
          <h3>个股信息</h3>
          <p>这里是个股信息的文本框。</p>
        </div>
      )}
    </div>
  );
};

export default DetailPage;