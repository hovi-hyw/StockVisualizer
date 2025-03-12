// frontend/src/pages/StockKlineDemo.js
/**
 * 股票K线图演示页面
 * 用于展示特定股票（600522）的K线图
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useState, useEffect } from 'react';
import { Card, Spin, message, DatePicker } from 'antd';
import moment from 'moment';
import KLineChart from '../components/KLineChart';
import { getStockInfo, getStockKline } from '../services/stockService';

const { RangePicker } = DatePicker;

/**
 * 600522股票K线图演示页面
 * @returns {JSX.Element} 股票K线图演示页面
 */
const StockKlineDemo = () => {
  const symbol = '600522'; // 固定展示600522股票
  const [loading, setLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState(null);
  const [klineData, setKlineData] = useState(null);
  const [dateRange, setDateRange] = useState([
    moment().subtract(1, 'year'),
    moment()
  ]);

  // 获取股票基本信息
  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        const response = await getStockInfo(symbol);
        setStockInfo(response);
      } catch (error) {
        message.error(`获取股票${symbol}信息失败`);
        console.error(`获取股票${symbol}信息失败:`, error);
      }
    };

    fetchStockInfo();
  }, []);

  // 获取K线数据
  useEffect(() => {
    const fetchKlineData = async () => {
      try {
        setLoading(true);
        const [startDate, endDate] = dateRange;
        const params = {
          start_date: startDate.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD')
        };

        const response = await getStockKline(symbol, params);
        setKlineData(response);
      } catch (error) {
        message.error(`获取股票${symbol}K线数据失败`);
        console.error(`获取股票${symbol}K线数据失败:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange && dateRange.length === 2) {
      fetchKlineData();
    }
  }, [dateRange]);

  // 日期范围变化处理函数
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  if (loading && !klineData) {
    return <Spin size="large" className="page-loading" />;
  }

  return (
    <div className="stock-kline-demo">
      <Card 
        title={stockInfo ? `${stockInfo.name} (${symbol})` : `股票 ${symbol}`}
        extra={
          <RangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
            allowClear={false}
          />
        }
      >
        {loading ? (
          <div className="loading-container">
            <Spin />
          </div>
        ) : (
          <KLineChart 
            data={klineData} 
            title={stockInfo ? `${stockInfo.name} (${symbol}) K线图` : `股票 ${symbol} K线图`}
          />
        )}
      </Card>
    </div>
  );
};

export default StockKlineDemo;