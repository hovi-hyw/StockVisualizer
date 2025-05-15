// frontend/src/components/ConceptSectors.js
/**
 * 概念板块组件
 * 展示概念板块及其相关个股
 * Authors: hovi.hyw & AI
 * Date: 2025-03-26
 * 更新: 2025-04-05 - 添加刷新按钮，优化刷新逻辑
 */

import React from 'react';
import { Card, List, Tag, Typography, Space, Spin, Row, Col, Tooltip, Button } from 'antd';
import { RiseOutlined, FallOutlined, PlusOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatLargeNumber } from '../../utils/formatters';

const { Title, Text } = Typography;

/**
 * 概念板块组件
 * @param {Object} props 组件属性
 * @param {Array} props.hotConcepts 热门概念数据
 * @param {Array} props.conceptStocks 概念相关个股数据
 * @param {Object} props.selectedConcept 当前选中的概念
 * @param {boolean} props.loading 加载状态
 * @param {string} props.error 错误信息
 * @param {Function} props.onConceptClick 概念点击事件处理函数
 * @param {Function} props.onSortChange 排序变更处理函数
 * @param {string} props.sortField 当前排序字段
 * @param {string} props.sortOrder 当前排序顺序
 * @param {Function} props.onAddToFavorites 添加到自选股处理函数
 * @param {Function} props.onRefresh 刷新数据处理函数
 * @returns {JSX.Element} 概念板块组件
 */
const ConceptSectors = ({
  hotConcepts,
  conceptStocks,
  selectedConcept,
  loading,
  error,
  onConceptClick,
  onSortChange,
  sortField,
  sortOrder,
  onAddToFavorites,
  onRefresh
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
      {/* 概念板块列表 */}
      <Col xs={24} sm={8} md={6}>
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Title level={4}><RiseOutlined style={{ color: '#52c41a' }} /> 概念板块</Title>
                <Tooltip 
                  title={<Typography.Paragraph style={{ whiteSpace: 'pre-line', margin: 0, color: '#fff' }}>基于该概念板块的讨论度、相关股票表现和资金流入综合计算，数值越高表示关注度越高。</Typography.Paragraph>}
                  placement="topRight"
                  overlayStyle={{ maxWidth: '300px' }}
                  overlayInnerStyle={{ backgroundColor: '#000', color: '#fff' }}
                >
                  <QuestionCircleOutlined className="info-icon" />
                </Tooltip>
              </Space>
              <Tooltip title="主动刷新，否则每5分钟刷新一次">
                <Button 
                  icon={<ReloadOutlined />} 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    onRefresh();
                  }}
                  loading={loading}
                />
              </Tooltip>
            </div>
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
              dataSource={hotConcepts}
              renderItem={(item) => (
                <List.Item 
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedConcept && selectedConcept.name === item.name ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                    borderLeft: selectedConcept && selectedConcept.name === item.name ? '3px solid #1890ff' : 'none',
                    paddingLeft: selectedConcept && selectedConcept.name === item.name ? '10px' : '13px'
                  }}
                  onClick={() => onConceptClick(item)}
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

      {/* 概念板块相关个股 */}
      <Col xs={24} sm={16} md={18}>
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Title level={4}>{selectedConcept ? `${selectedConcept.name}相关个股` : '概念相关个股'}</Title>
              </Space>
            </div>
          }
          className="hotspot-card"
          bordered={false}
          style={{ height: '600px', display: 'flex', flexDirection: 'column' }} // 设置固定高度并允许内部滚动
        >
          {loading && !selectedConcept ? ( // 初始加载时显示
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin tip="加载中..." />
            </div>
          ) : conceptStocks.length > 0 ? (
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
                  {conceptStocks.map((stock, index) => (
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
                        <Text style={{ color: getChangeColor(stock.change_percent) }}>{stock.change_percent}</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text type="secondary">{stock.amplitude}</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text type="secondary">{formatLargeNumber(stock.amount)}</Text>
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <Text type="secondary">{stock.turnover_rate}</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">{selectedConcept ? `暂无${selectedConcept.name}相关个股数据` : '请先选择一个概念'}</Text>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ConceptSectors;