// frontend/src/components/HotIndustries.js
/**
 * 热门行业组件
 * 展示热门行业及其相关个股
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 */

import React, { useState } from 'react';
import { Card, List, Tag, Typography, Space, Spin, Row, Col, Tooltip, Button, message } from 'antd';
import { FireOutlined, RiseOutlined, FallOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatLargeNumber } from '../../utils/formatters';

const { Title, Text } = Typography;

/**
 * 热门行业组件
 * @param {Object} props 组件属性
 * @param {Array} props.hotIndustries 热门行业数据
 * @param {Array} props.industryStocks 行业相关个股数据
 * @param {Object} props.selectedIndustry 当前选中的行业
 * @param {boolean} props.loading 加载状态
 * @param {string} props.error 错误信息
 * @param {Function} props.onIndustryClick 行业点击事件处理函数
 * @param {Function} props.onSortChange 排序变更处理函数
 * @param {string} props.sortField 当前排序字段
 * @param {string} props.sortOrder 当前排序顺序
 * @param {Function} props.onAddToFavorites 添加到自选股处理函数
 * @returns {JSX.Element} 热门行业组件
 */
const HotIndustries = ({
  hotIndustries,
  industryStocks,
  selectedIndustry,
  loading,
  error,
  onIndustryClick,
  onSortChange,
  sortField,
  sortOrder,
  onAddToFavorites
}) => {
  // 根据涨跌幅返回不同颜色
  const getChangeColor = (change) => {
    // 确保change是字符串类型
    const changeStr = String(change || '0');
    // 将字符串转换为数字进行比较
    const value = parseFloat(changeStr.replace('%', '').replace('+', ''));
    // 保持涨跌颜色一致，不受主题影响
    return value >= 0 ? '#cf1322' : '#3f8600';
  };

  // 根据热度返回标签颜色
  const getHotTagColor = (hot) => {
    // 保持热度标签颜色一致，不受主题影响
    if (hot >= 90) return 'volcano';
    if (hot >= 80) return 'orange';
    return 'gold';
  };

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
      {/* 热门行业列表 */}
      <Col xs={24} sm={8} md={6}>
        <Card 
          title={
            <Space>
              <Title level={4}><FireOutlined style={{ color: '#ff4d4f' }} /> 热门行业</Title>
              <Tooltip 
                title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0, color: '#fff' }}>基于该行业成交量、换手率和涨跌幅综合计算，数值越高表示关注度越高。</Typography.Paragraph>}
                placement="topRight"
                overlayStyle={{ maxWidth: '300px' }}
                overlayInnerStyle={{ backgroundColor: '#000', color: '#fff' }}
              >
                <QuestionCircleOutlined className="info-icon" />
              </Tooltip>
            </Space>
          }
          className="hotspot-card"
          bordered={false}
          style={{ height: '600px' }} // 设置固定高度
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin tip="加载市场热点数据中..." />
            </div>
          ) : error ? (
            <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>
          ) : (
            <List
              dataSource={hotIndustries}
              renderItem={(item) => (
                <List.Item 
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedIndustry && selectedIndustry.name === item.name ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                    borderLeft: selectedIndustry && selectedIndustry.name === item.name ? '3px solid #1890ff' : 'none',
                    paddingLeft: selectedIndustry && selectedIndustry.name === item.name ? '10px' : '13px'
                  }}
                  onClick={() => onIndustryClick(item)}
                >
                  <div className="hotspot-item" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{item.name}</Text>
                    <Space>
                      <Text style={{ color: getChangeColor(item.change) }}>
                        {item.change.startsWith('+') ? <RiseOutlined /> : <FallOutlined />} {item.change}
                      </Text>
                      <Tag color={getHotTagColor(item.hot)}>热度 {item.hot}</Tag>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </Col>

      {/* 热门行业相关个股 */}
      <Col xs={24} sm={16} md={18}>
        <Card 
          title={
            <Space>
              <Title level={4}>{selectedIndustry ? `${selectedIndustry.name}相关个股` : '行业相关个股'}</Title>
            </Space>
          }
          className="hotspot-card"
          bordered={false}
          style={{ height: '600px', display: 'flex', flexDirection: 'column' }} // 设置固定高度并允许内部滚动
        >
          {loading && !selectedIndustry ? ( // 初始加载时显示
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin tip="加载中..." />
            </div>
          ) : industryStocks.length > 0 ? (
            <div style={{ flexGrow: 1, overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100% - 56px)' }}>
              <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                      <div 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => onSortChange('name')}
                      >
                        <span>股票名称</span>
                        {sortField === 'name' && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                      <div 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => onSortChange('code')}
                      >
                        <span>代码</span>
                        {sortField === 'code' && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <div 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                        onClick={() => onSortChange('change_percent')}
                      >
                        <span>涨跌幅</span>
                        {sortField === 'change_percent' && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <div 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                        onClick={() => onSortChange('amplitude')}
                      >
                        <span>振幅</span>
                        {sortField === 'amplitude' && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <div 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                        onClick={() => onSortChange('amount')}
                      >
                        <span>成交额</span>
                        {sortField === 'amount' && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <div 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                        onClick={() => onSortChange('turnover_rate')}
                      >
                        <span>换手率</span>
                        {sortField === 'turnover_rate' && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {industryStocks.map((stock, index) => (
                    <tr key={stock.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 4px' }}>
                        <Space>
                          <Link to={`/detail/stock/${stock.code.startsWith('6') ? 'sh' : 'sz'}${stock.code}`} style={{ color: 'inherit' }}>
                            <Text strong>{stock.name}</Text>
                          </Link>
                          <Button 
                            type="text" 
                            icon={<PlusOutlined />} 
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              onAddToFavorites(stock);
                            }}
                          />
                        </Space>
                      </td>
                      <td style={{ padding: '8px 4px' }}>
                        <Text type="secondary">{stock.code}</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text style={{ color: getChangeColor(stock.change_percent) }}>{stock.change_percent}%</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text type="secondary">{stock.amplitude}%</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text type="secondary">{formatLargeNumber(stock.amount)}</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text type="secondary">{stock.turnover_rate}%</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">{selectedIndustry ? `暂无${selectedIndustry.name}相关个股数据` : '请先选择一个行业'}</Text>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default HotIndustries;