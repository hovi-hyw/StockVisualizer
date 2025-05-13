// frontend/src/components/StockFunds.js
/**
 * 股票基金组件
 * 展示热门股票基金及其相关数据
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Space, Spin, Tooltip, Tag } from 'antd';
import { FundOutlined, RiseOutlined, FallOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getHotFunds } from '../../services/fundService';

const { Title, Text } = Typography;

/**
 * 股票基金组件
 * @param {Object} props 组件属性
 * @param {Array} props.fundList 基金列表数据
 * @param {boolean} props.loading 加载状态
 * @param {string} props.error 错误信息
 * @returns {JSX.Element} 股票基金组件
 */
const StockFunds = () => {
  // 状态定义
  const [fundList, setFundList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 检查是否在交易时间内（9:00-16:00）
  const isTradeTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    // 交易时间：9:00-16:00
    return currentTime >= 900 && currentTime <= 1600;
  };
  
  // 获取热门基金数据
  useEffect(() => {
    const fetchHotFunds = async () => {
      try {
        setLoading(true);
        const data = await getHotFunds({ limit: 5 });
        if (data && Array.isArray(data)) {
          setFundList(data);
        }
        setError(null);
      } catch (err) {
        console.error('获取热门基金数据失败:', err);
        setError('获取热门基金数据失败');
      } finally {
        setLoading(false);
      }
    };

    // 首次加载数据
    fetchHotFunds();

    // 设置定时刷新（每3分钟刷新一次）
    const intervalId = setInterval(() => {
      // 只在交易时间内更新数据
      if (isTradeTime()) {
        fetchHotFunds();
      }
    }, 3 * 60 * 1000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);
  
  // 根据涨跌幅返回不同颜色
  const getChangeColor = (change) => {
    // 确保change是字符串类型
    const changeStr = String(change || '0');
    // 将字符串转换为数字进行比较
    const value = parseFloat(changeStr.replace('%', '').replace('+', ''));
    // 保持涨跌颜色一致，不受主题影响
    return value >= 0 ? '#cf1322' : '#3f8600';
  };

  // 根据基金类型返回标签颜色
  const getFundTypeColor = (type) => {
    switch(type) {
      case '股票型':
        return 'blue';
      case '混合型':
        return 'purple';
      case '指数型':
        return 'cyan';
      case 'ETF':
        return 'geekblue';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      title={
        <Space>
          <Title level={4}><FundOutlined /> 热门基金</Title>
          <Tooltip 
            title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0, color: '#fff' }}>展示当前市场中表现活跃的股票型基金，包括股票型、混合型和指数型基金等。数据基于基金规模、近期表现和投资者关注度综合排名。</Typography.Paragraph>}
            placement="topRight"
            overlayStyle={{ maxWidth: '300px' }}
            overlayInnerStyle={{ backgroundColor: '#000', color: '#fff' }}
          >
            <QuestionCircleOutlined className="info-icon" />
          </Tooltip>
        </Space>
      }
      className="fund-card"
      bordered={false}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载基金数据中..." />
        </div>
      ) : error ? (
        <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>
      ) : (
        <List
          dataSource={fundList}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <Text strong>
                    <Link to={`/fund/${item.code}`}>{item.name}</Link>
                  </Text>
                  <Text type="secondary">{item.code}</Text>
                </Space>
                <Space>
                  <Text style={{ color: getChangeColor(item.change) }}>
                    {parseFloat(item.change) >= 0 ? <RiseOutlined /> : <FallOutlined />} {item.change}
                  </Text>
                  <Tag color={getFundTypeColor(item.type)}>{item.type}</Tag>
                </Space>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default StockFunds;