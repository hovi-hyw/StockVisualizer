# 股票数据可视化系统 - 开发手册

## 目录

1. [项目概述](#项目概述)
2. [系统架构](#系统架构)
3. [技术栈](#技术栈)
4. [开发环境配置](#开发环境配置)
5. [项目结构](#项目结构)
6. [前端开发指南](#前端开发指南)
7. [后端开发指南](#后端开发指南)
8. [API文档](#API文档)
9. [数据库设计](#数据库设计)
10. [部署指南](#部署指南)
11. [常见问题](#常见问题)

## 项目概述

股票数据可视化系统是一个专业的金融数据分析平台，致力于为投资者提供全面、直观的市场数据和分析工具。系统整合了多种数据源，提供实时的股票价格、交易量、技术指标和市场指数，帮助用户做出更明智的投资决策。

### 主要功能

- 实时股票数据展示
- 专业K线图表分析
- 市场指数追踪
- 热门板块和概念展示
- 市场新闻资讯

## 系统架构

股票数据可视化系统采用前后端分离的架构，主要包括以下几个部分：

1. **前端**：基于React的单页应用，负责数据展示和用户交互
2. **后端API**：基于FastAPI的RESTful API，提供数据访问接口
3. **数据库**：PostgreSQL数据库，存储股票、ETF、基金和指数数据
4. **数据采集**：定时任务，负责从外部数据源获取最新数据

## 技术栈

### 前端技术栈

- **框架**：React.js
- **UI库**：Ant Design
- **状态管理**：React Hooks
- **路由**：React Router
- **HTTP客户端**：Axios
- **图表库**：Echarts/AntV

### 后端技术栈

- **框架**：FastAPI
- **ORM**：SQLAlchemy
- **数据处理**：Pandas, NumPy
- **API文档**：Swagger UI (FastAPI内置)

### 开发工具

- **容器化**：Docker, Docker Compose
- **版本控制**：Git
- **API测试**：Postman

## 开发环境配置

### 前提条件

- 安装 [Docker](https://www.docker.com/get-started)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)
- 安装 [Git](https://git-scm.com/downloads)

### 启动开发环境

在项目根目录下运行以下命令：

```bash
# 使用开发环境配置启动
docker-compose -f deployment/docker-compose.dev.yml up
```

这将启动：
- 前端开发服务器 (React) - 访问 http://localhost:3001
- 后端API服务器 (FastAPI) - 访问 http://localhost:8970

### 代码实时更新

开发环境配置已经设置了卷挂载，当你修改本地代码时：

- **前端代码**：React开发服务器会自动检测变化并重新编译，浏览器会自动刷新
- **后端代码**：uvicorn服务器使用`--reload`参数，会自动检测Python文件变化并重启服务

### 环境变量配置

项目使用`.env`文件管理环境变量。在项目根目录下创建`.env`文件，参考`.env.example`填写必要的环境变量。

## 项目结构

```
/
├── backend/                # 后端代码
│   ├── api/               # API路由定义
│   ├── config/            # 配置文件
│   ├── database/          # 数据库连接和查询
│   ├── models/            # 数据模型
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具函数
│   ├── main.py            # 应用入口
│   └── requirements.txt   # 依赖列表
│
├── frontend/              # 前端代码
│   ├── public/            # 静态资源
│   ├── src/               # 源代码
│   │   ├── components/    # 组件
│   │   ├── contexts/      # 上下文
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   └── utils/         # 工具函数
│   ├── package.json       # 依赖配置
│   └── Dockerfile         # 前端Docker配置
│
├── deployment/            # 部署配置
│   ├── docker-compose.yml        # 生产环境配置
│   └── docker-compose.dev.yml    # 开发环境配置
│
├── docs/                  # 文档
└── README.md              # 项目说明
```

## 前端开发指南

### 组件结构

前端采用组件化开发方式，主要组件包括：

- **页面组件**：位于`src/pages`目录，如`HomePage`、`StockPage`等
- **功能组件**：位于`src/components`目录，如`StockList`、`MarketHotspot`等
- **服务组件**：位于`src/services`目录，负责API调用

### 添加新页面

1. 在`src/pages`目录下创建新的页面组件
2. 在`App.js`中添加路由配置

### 添加新组件

1. 在`src/components`目录下创建新的组件文件
2. 编写组件代码，遵循项目的代码风格
3. 在需要的地方导入并使用该组件

### API调用

使用`src/services`目录下的服务函数进行API调用，例如：

```javascript
import { getStockList } from '../services/stockService';

// 在组件中使用
const fetchData = async () => {
  try {
    const data = await getStockList({ page: 1, pageSize: 20 });
    // 处理数据
  } catch (error) {
    // 处理错误
  }
};
```

## 后端开发指南

### API路由

后端API路由定义在`backend/api`目录下，主要包括：

- `stock_api.py`：股票相关API
- `index_api.py`：指数相关API
- `market_api.py`：市场数据相关API

### 添加新API

1. 在相应的API文件中定义新的路由函数
2. 在`router.py`中注册该路由

示例：

```python
# 在stock_api.py中添加新API
@router.get("/stocks/{symbol}/details")
def get_stock_details(symbol: str):
    # 实现逻辑
    return {"symbol": symbol, "details": "..."}

# 在router.py中注册
from .stock_api import router as stock_router
api_router.include_router(stock_router, tags=["stocks"])
```

### 数据库操作

使用`database/queries.py`中定义的函数进行数据库操作，或在需要时添加新的查询函数。

## API文档

系统API文档详见[API文档](api_documentation.md)。

### 主要API端点

- `/api/stocks`：获取股票列表
- `/api/stocks/{symbol}/kline`：获取股票K线数据
- `/api/stocks/{symbol}/real-change`：获取股票真实涨跌数据
- `/api/etfs`：获取ETF列表
- `/api/etfs/{symbol}/kline`：获取ETF K线数据
- `/api/funds`：获取基金列表
- `/api/funds/{symbol}/history`：获取基金净值历史数据
- `/api/indices`：获取指数列表
- `/api/indices/{symbol}/kline`：获取指数K线数据
- `/api/market/hotspots`：获取市场热点
- `/api/market/news`：获取市场新闻

## 数据库设计

系统使用PostgreSQL数据库，主要表结构包括：

- `stocks`：股票基本信息
  - symbol: 股票代码
  - name: 股票名称
  - current_price: 当前价格
  - change_percent: 涨跌幅
  - volume: 成交量
  - turnover: 成交额
  - pe_ratio: 市盈率
  - market_cap: 市值

- `stock_prices`：股票价格历史数据
  - symbol: 股票代码
  - date: 日期
  - open: 开盘价
  - high: 最高价
  - low: 最低价
  - close: 收盘价
  - volume: 成交量
  - turnover: 成交额

- `etfs`：ETF基本信息
  - symbol: ETF代码
  - name: ETF名称
  - current_price: 当前价格
  - change_percent: 涨跌幅
  - volume: 成交量
  - turnover: 成交额
  - net_value: 净值
  - premium_rate: 溢价率
  - tracking_index: 跟踪指数

- `etf_prices`：ETF价格历史数据
  - symbol: ETF代码
  - date: 日期
  - open: 开盘价
  - high: 最高价
  - low: 最低价
  - close: 收盘价
  - volume: 成交量
  - turnover: 成交额
  - net_value: 净值

- `funds`：基金基本信息
  - symbol: 基金代码
  - name: 基金名称
  - type: 基金类型
  - net_value: 净值
  - accumulative_value: 累计净值
  - daily_growth: 日涨跌幅
  - weekly_growth: 周涨跌幅
  - monthly_growth: 月涨跌幅
  - yearly_growth: 年涨跌幅
  - fund_size: 基金规模
  - fund_manager: 基金经理
  - management_fee: 管理费率
  - custodian_fee: 托管费率

- `fund_net_values`：基金净值历史数据
  - symbol: 基金代码
  - date: 日期
  - net_value: 净值
  - accumulative_value: 累计净值
  - daily_growth: 日涨跌幅
  - dividend: 分红

- `indices`：指数基本信息
  - symbol: 指数代码
  - name: 指数名称
  - current_price: 当前点位
  - change_percent: 涨跌幅
  - volume: 成交量
  - turnover: 成交额

- `index_prices`：指数价格历史数据
  - symbol: 指数代码
  - date: 日期
  - open: 开盘点位
  - high: 最高点位
  - low: 最低点位
  - close: 收盘点位
  - volume: 成交量
  - turnover: 成交额

- `market_news`：市场新闻

## 部署指南

详细部署指南请参考[部署指南](deployment_guide.md)。

### 生产环境部署

```bash
# 使用生产环境配置启动
docker-compose -f deployment/docker-compose.yml up -d
```

## 常见问题

### 1. 前端无法连接后端API

- 检查`REACT_APP_API_URL`环境变量设置
- 确保后端服务正常运行
- 检查网络连接和防火墙设置

### 2. 数据库连接失败

- 检查数据库连接字符串
- 确保数据库服务正常运行
- 检查用户名和密码是否正确

### 3. Docker容器启动失败

- 检查Docker和Docker Compose是否正确安装
- 检查端口是否被占用
- 查看容器日志了解详细错误信息

```bash
docker-compose -f deployment/docker-compose.dev.yml logs
```

---

本文档最后更新于：2025-03-18