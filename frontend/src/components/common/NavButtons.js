// frontend/src/components/NavButtons.js
/**
 * 此组件用于展示页面右上角的导航按钮。
 * 提供在主页、股票和指数页面之间快速切换的功能。
 * 新增自选股功能，可以添加、删除和查看自选股。
 * Authors: hovi.hyw & AI
 * Date: 2025-03-12
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Dropdown, Input, List, Typography, Modal, message, Tooltip } from 'antd';
import { HomeOutlined, LineChartOutlined, FundOutlined, StarOutlined, PlusOutlined, MinusOutlined, SearchOutlined, BulbOutlined, BulbFilled, ExportOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { getStockList } from '../../services/stockService';
import { getIndexList } from '../../services/indexService';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * 导航按钮组件
 * @returns {JSX.Element} 导航按钮组件
 */
const NavButtons = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme: currentTheme, toggleTheme } = useTheme();
  
  // 自选股相关状态
  const [favoriteVisible, setFavoriteVisible] = useState(false);
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchType, setSearchType] = useState('stock'); // 'stock' 或 'index'
  
  // 搜索框引用
  const searchInputRef = useRef(null);

  // 自选股下拉菜单打开时重新加载数据
  const handleFavoriteVisibleChange = (visible) => {
    setFavoriteVisible(visible);
    
    // 当打开下拉菜单时，重新从localStorage加载最新的自选股数据
    if (visible) {
      const savedFavorites = localStorage.getItem('favoriteStocks');
      if (savedFavorites) {
        try {
          setFavoriteStocks(JSON.parse(savedFavorites));
        } catch (e) {
          console.error('解析自选股数据失败:', e);
        }
      }
    }
  };

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
  const addToFavorites = (item) => {
    if (!favoriteStocks.some(stock => stock.symbol === item.symbol)) {
      // 确保添加type属性，用于区分股票和指数
      const itemWithType = {
        ...item,
        type: searchType // 'stock' 或 'index'
      };
      const newFavorites = [...favoriteStocks, itemWithType];
      saveFavorites(newFavorites);
      message.success(`已添加 ${item.name} 到自选股`);
      setSearchVisible(false);
      setSearchText('');
      setSearchResults([]);
    } else {
      message.info(`${item.name} 已在自选股中`);
    }
  };

  // 删除自选股
  const removeFromFavorites = (symbol) => {
    const newFavorites = favoriteStocks.filter(item => item.symbol !== symbol);
    saveFavorites(newFavorites);
    message.success('已从自选股中移除');
  };

  // 搜索股票或指数
  const searchItems = async () => {
    if (!searchText.trim()) {
      message.info(`请输入${searchType === 'stock' ? '股票' : '指数'}代码或名称`);
      return;
    }
    
    setSearching(true);
    try {
      let response;
      
      if (searchType === 'stock') {
        response = await getStockList({
          search: searchText,
          page_size: 10,
          page: 1
        });
      } else {
        response = await getIndexList({
          search: searchText,
          page_size: 10,
          page: 1
        });
      }
      
      if (response && response.items) {
        setSearchResults(response.items);
      } else {
        setSearchResults([]);
        message.info(`未找到相关${searchType === 'stock' ? '股票' : '指数'}`);
      }
    } catch (error) {
      console.error(`搜索${searchType === 'stock' ? '股票' : '指数'}失败:`, error);
      message.error('搜索失败，请稍后重试');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  // 导出自选股
  const exportFavorites = () => {
    if (favoriteStocks.length === 0) {
      message.info('暂无自选股可导出');
      return;
    }
    
    // 提取股票代码（去除前缀）和名称
    const symbols = favoriteStocks.map(item => {
      // 去除sz、sh、bj前缀
      const pureSymbol = item.symbol.replace(/^(sz|sh|bj)/, '');
      return pureSymbol;
    }).join(',');
    
    const names = favoriteStocks.map(item => item.name).join(',');
    
    // 创建导出内容
    const exportContent = `${symbols}\n${names}`;
    
    // 创建Blob对象
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '自选股_' + new Date().toISOString().split('T')[0] + '.txt';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('自选股导出成功');
  };

  // 自选股下拉内容
  const favoriteContent = (
    <div style={{ 
      width: 300, 
      padding: '12px', 
      background: currentTheme === 'dark' ? '#1f1f1f' : '#fff', 
      color: currentTheme === 'dark' ? '#fff' : '#000',
      borderRadius: '8px', 
      boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.15)' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>我的自选股</Typography.Title>
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setSearchVisible(true);
              // 使用setTimeout确保DOM已更新
              setTimeout(() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 100);
            }}
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
          <Button 
            type="default" 
            size="small" 
            icon={<ExportOutlined />} 
            disabled={favoriteStocks.length === 0}
            onClick={exportFavorites}
          />
        </Space>
      </div>

      {/* 搜索框 */}
      {searchVisible && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', marginBottom: '8px' }}>
            <Button 
              type={searchType === 'stock' ? 'primary' : 'default'}
              size="small"
              onClick={() => setSearchType('stock')}
              style={{ flex: 1, borderRadius: '4px 0 0 4px' }}
            >
              股票
            </Button>
            <Button 
              type={searchType === 'index' ? 'primary' : 'default'}
              size="small"
              onClick={() => setSearchType('index')}
              style={{ flex: 1, borderRadius: '0 4px 4px 0' }}
            >
              指数
            </Button>
          </div>
          <Input.Search
            ref={searchInputRef}
            placeholder={`输入${searchType === 'stock' ? '股票' : '指数'}代码或名称`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={searchItems}
            loading={searching}
            enterButton
          />
          {searchResults.length > 0 && (
            <List
              size="small"
              style={{ 
                maxHeight: '200px', 
                overflow: 'auto', 
                marginTop: '8px',
                background: currentTheme === 'dark' ? '#1f1f1f' : '#fff',
                borderColor: currentTheme === 'dark' ? '#444' : '#d9d9d9'
              }}
              bordered
              dataSource={searchResults}
              renderItem={item => (
                <List.Item
                  style={{ borderColor: currentTheme === 'dark' ? '#444' : '#d9d9d9' }}
                  actions={[
                    <Button 
                      type="link" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={() => addToFavorites(item)}
                    />
                  ]}
                >
                  <Typography.Text style={{ color: currentTheme === 'dark' ? '#fff' : 'inherit' }}>{item.symbol}</Typography.Text>
                  <Typography.Text style={{ marginLeft: '8px', color: currentTheme === 'dark' ? '#fff' : 'inherit' }}>{item.name}</Typography.Text>
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
          style={{ 
            background: currentTheme === 'dark' ? '#1f1f1f' : '#fff',
            borderColor: currentTheme === 'dark' ? '#444' : '#d9d9d9'
          }}
          dataSource={favoriteStocks}
          renderItem={item => (
            <List.Item
              style={{ borderColor: currentTheme === 'dark' ? '#444' : '#d9d9d9' }}
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
              <Link to={`/detail/${item.type || 'stock'}/${item.symbol}`} style={{ display: 'flex', flex: 1, color: currentTheme === 'dark' ? '#fff' : 'inherit' }}>
                <Typography.Text style={{ color: currentTheme === 'dark' ? '#fff' : 'inherit' }}>{item.symbol}</Typography.Text>
                <Typography.Text style={{ marginLeft: '8px', color: currentTheme === 'dark' ? '#fff' : 'inherit' }}>{item.name}</Typography.Text>
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
      background: currentTheme === 'dark' ? 'rgba(33, 33, 33, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: currentTheme === 'dark' ? '0 2px 8px rgba(255, 255, 255, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}>
      <Space>
        {/* 主页按钮 */}
      <Tooltip title="主页">
        <Button 
          type={currentPath === '/' ? 'primary' : 'default'} 
          icon={<HomeOutlined />} 
          shape="circle"
          onClick={() => window.location.href = '/'}
        />
      </Tooltip>
      
      {/* 股票按钮 */}
      <Tooltip title="股票">
        <Button 
          type={currentPath === '/stocks' ? 'primary' : 'default'} 
          icon={<LineChartOutlined />} 
          shape="circle"
          onClick={() => window.location.href = '/stocks'}
        />
      </Tooltip>
      
      {/* 指数按钮 */}
      <Tooltip title="指数">
        <Button 
          type={currentPath === '/indices' ? 'primary' : 'default'} 
          icon={<FundOutlined />} 
          shape="circle"
          onClick={() => window.location.href = '/indices'}
        />
      </Tooltip>
      
      {/* 市场分布按钮 */}
      <Tooltip title="市场分布">
        <Button 
          type={currentPath === '/market-distribution' ? 'primary' : 'default'} 
          icon={<BarChartOutlined />} 
          shape="circle"
          onClick={() => window.location.href = '/market-distribution'}
        />
      </Tooltip>
      
      {/* ETF按钮 */}
      <Tooltip title="ETF">
        <Button 
          type={currentPath === '/etfs' ? 'primary' : 'default'} 
          icon={<FundOutlined />} 
          shape="circle"
          onClick={() => window.location.href = '/etfs'}
        />
      </Tooltip>
      
      {/* 市盈率走势按钮 */}
      <Tooltip title="市盈率走势">
        <Button 
          type={currentPath === '/market-pe-ratio' ? 'primary' : 'default'} 
          icon={<LineChartOutlined />} 
          shape="circle"
          onClick={() => window.location.href = '/market-pe-ratio'}
        />
      </Tooltip>
        <Dropdown
          open={favoriteVisible}
          onOpenChange={handleFavoriteVisibleChange}
          overlay={favoriteContent}
          placement="bottomRight"
        >
          <Button
            type={currentPath === '/favorites' ? 'primary' : 'default'}
            icon={<StarOutlined />}
            onClick={() => setFavoriteVisible(!favoriteVisible)}
          >
            自选股
          </Button>
        </Dropdown>
        <Tooltip title={currentTheme === 'light' ? '切换到暗色模式' : '切换到明亮模式'}>
          <Button 
            type="default"
            icon={currentTheme === 'light' ? <BulbOutlined /> : <BulbFilled />}
            size="middle"
            onClick={toggleTheme}
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default NavButtons;