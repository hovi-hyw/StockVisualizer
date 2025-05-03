// frontend/src/components/NavButtons.js
/**
 * 此组件用于展示页面右上角的导航按钮。
 * 提供在主页、股票和指数页面之间快速切换的功能。
 * 新增自选股功能，可以添加、删除和查看自选股。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useState, useEffect } from 'react';
import { Button, Space, Dropdown, Input, List, Typography, Modal, message } from 'antd';
import { HomeOutlined, LineChartOutlined, FundOutlined, StarOutlined, PlusOutlined, MinusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { getStockList } from '../services/stockService';

/**
 * 导航按钮组件
 * @returns {JSX.Element} 导航按钮组件
 */
const NavButtons = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 自选股相关状态
  const [favoriteVisible, setFavoriteVisible] = useState(false);
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // 从本地存储加载自选股
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteStocks');
    if (savedFavorites) {
      try {
        setFavoriteStocks(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('解析自选股数据失败:', e);
      }
    }
  }, []);

  // 保存自选股到本地存储
  const saveFavorites = (stocks) => {
    localStorage.setItem('favoriteStocks', JSON.stringify(stocks));
    setFavoriteStocks(stocks);
  };

  // 添加自选股
  const addToFavorites = (stock) => {
    if (!favoriteStocks.some(item => item.symbol === stock.symbol)) {
      const newFavorites = [...favoriteStocks, stock];
      saveFavorites(newFavorites);
      message.success(`已添加 ${stock.name} 到自选股`);
      setSearchVisible(false);
      setSearchText('');
      setSearchResults([]);
    } else {
      message.info(`${stock.name} 已在自选股中`);
    }
  };

  // 删除自选股
  const removeFromFavorites = (symbol) => {
    const newFavorites = favoriteStocks.filter(item => item.symbol !== symbol);
    saveFavorites(newFavorites);
    message.success('已从自选股中移除');
  };

  // 搜索股票
  const searchStocks = async () => {
    if (!searchText.trim()) {
      message.info('请输入股票代码或名称');
      return;
    }
    
    setSearching(true);
    try {
      const response = await getStockList({
        search: searchText,
        page_size: 10,
        page: 1
      });
      
      if (response && response.items) {
        setSearchResults(response.items);
      } else {
        setSearchResults([]);
        message.info('未找到相关股票');
      }
    } catch (error) {
      console.error('搜索股票失败:', error);
      message.error('搜索失败，请稍后重试');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // 自选股下拉内容
  const favoriteContent = (
    <div style={{ width: 300, padding: '12px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>我的自选股</Typography.Title>
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />} 
            onClick={() => setSearchVisible(true)}
          />
          <Button 
            type="default" 
            size="small" 
            icon={<MinusOutlined />} 
            danger 
            disabled={favoriteStocks.length === 0}
            onClick={() => {
              if (favoriteStocks.length > 0) {
                Modal.confirm({
                  title: '确认删除',
                  content: '确定要清空所有自选股吗？',
                  onOk: () => {
                    saveFavorites([]);
                    message.success('已清空自选股');
                  }
                });
              }
            }}
          />
        </Space>
      </div>

      {/* 搜索框 */}
      {searchVisible && (
        <div style={{ marginBottom: '12px' }}>
          <Input.Search
            placeholder="输入股票代码或名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={searchStocks}
            loading={searching}
            enterButton
          />
          {searchResults.length > 0 && (
            <List
              size="small"
              style={{ maxHeight: '200px', overflow: 'auto', marginTop: '8px' }}
              bordered
              dataSource={searchResults}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={() => addToFavorites(item)}
                    />
                  ]}
                >
                  <Typography.Text>{item.symbol}</Typography.Text>
                  <Typography.Text style={{ marginLeft: '8px' }}>{item.name}</Typography.Text>
                </List.Item>
              )}
            />
          )}
        </div>
      )}

      {/* 自选股列表 */}
      {favoriteStocks.length > 0 ? (
        <List
          size="small"
          bordered
          dataSource={favoriteStocks}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<MinusOutlined />} 
                  size="small"
                  danger
                  onClick={() => removeFromFavorites(item.symbol)}
                />
              ]}
            >
              <Link to={`/detail/stock/${item.symbol}`} style={{ display: 'flex', flex: 1 }}>
                <Typography.Text>{item.symbol}</Typography.Text>
                <Typography.Text style={{ marginLeft: '8px' }}>{item.name}</Typography.Text>
              </Link>
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Typography.Text type="secondary">暂无自选股，请点击 + 添加</Typography.Text>
        </div>
      )}
    </div>
  );

  return (
    <div className="nav-buttons" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}>
      <Space>
        <Button 
          type={currentPath === '/' ? 'primary' : 'default'}
          icon={<HomeOutlined />}
          size="middle"
        >
          <Link to="/">主页</Link>
        </Button>
        <Button 
          type={currentPath === '/stocks' ? 'primary' : 'default'}
          icon={<LineChartOutlined />}
          size="middle"
        >
          <Link to="/stocks">股票</Link>
        </Button>
        <Button 
          type={currentPath === '/indices' ? 'primary' : 'default'}
          icon={<FundOutlined />}
          size="middle"
        >
          <Link to="/indices">指数</Link>
        </Button>
        <Dropdown 
          overlay={favoriteContent} 
          trigger={['click']} 
          visible={favoriteVisible}
          onVisibleChange={setFavoriteVisible}
          placement="bottomRight"
        >
          <Button 
            type={favoriteVisible ? 'primary' : 'default'}
            icon={<StarOutlined />}
            size="middle"
          >
            自选股
          </Button>
        </Dropdown>
      </Space>
    </div>
  );
};

export default NavButtons;