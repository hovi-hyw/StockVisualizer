// frontend/src/pages/DetailPage.js
/**
 * 详情页面组件
 * 展示股票或指数的详细信息，包括K线图等数据可视化内容
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { LineChartOutlined, FundOutlined, StockOutlined } from '@ant-design/icons';
import KLineChart from '../components/KLineChart';
import { getStockInfo, getStockKline } from '../services/stockService';
import { getIndexInfo, getIndexKline } from '../services/indexService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getPriceDirection } from '../utils/helpers';

/**
 * 详情页面组件
 * @returns {JSX.Element} 详情页面组件
 */
const DetailPage = () => {
  const { type, symbol } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [klineData, setKlineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (type === 'stock') {
          const basicInfo = await getStockInfo(symbol);
          const klineInfo = await getStockKline(symbol);
          response = {
            basic: basicInfo,
            kline: klineInfo
          };
        } else {
          const basicInfo = await getIndexInfo(symbol);
          const klineInfo = await getIndexKline(symbol);
          response = {
            basic: basicInfo,
            kline: klineInfo
          };
        }
        setData(response.basic);
        setKlineData(response.kline);
      } catch (error) {
        message.error('获取数据失败');
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, symbol]);

  if (loading) {
    return <Spin size="large" className="page-loading" />;
  }

  if (!data) {
    return <div>数据不存在</div>;
  }

  const direction = getPriceDirection(data.current_price, data.prev_close_price);
  const priceColor = direction === 'up' ? '#ff4d4f' : direction === 'down' ? '#52c41a' : '';

  return (
    <div className="detail-page">
      <Card className="basic-info-card">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h1>{data.name} ({data.symbol})</h1>
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="最新价"
              value={data.current_price}
              precision={2}
              valueStyle={{ color: priceColor }}
              prefix={type === 'stock' ? <StockOutlined /> : <FundOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="涨跌幅"
              value={data.change_percent}
              precision={2}
              valueStyle={{ color: priceColor }}
              suffix="%"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="成交量"
              value={data.volume}
              precision={0}
              prefix={<LineChartOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card title="K线图" className="kline-card">
        <KLineChart data={klineData} />
      </Card>

      <Card title="交易数据" className="trading-data-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic title="开盘价" value={data.open_price} precision={2} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="最高价" value={data.high_price} precision={2} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="最低价" value={data.low_price} precision={2} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="昨收价" value={data.prev_close_price} precision={2} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic 
              title="成交额" 
              value={data.turnover}
              precision={2}
              formatter={value => formatCurrency(value, 2)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic 
              title="换手率" 
              value={data.turnover_rate}
              precision={2}
              formatter={value => formatPercent(value)}
              suffix="%"
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DetailPage;