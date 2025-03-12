# 股票数据可视化系统 (StockVisualizer)

## 项目简介

本项目是一个基于 PostgreSQL 数据库中股票和指数数据的可视化系统。系统从数据库读取股票和指数的历史数据，通过 Web 界面展示股票列表和 K 线图，支持用户查看和分析股票/指数的历史走势。

## 系统架构

系统采用前后端分离的架构设计：

```
+------------------+    +------------------+    +------------------+
|                  |    |                  |    |                  |
|  前端应用层       |<-->|  后端服务层      |<-->|  数据存储层      |
|  (React)         |    |  (FastAPI)      |    |  (PostgreSQL)   |
|                  |    |                  |    |                  |
+------------------+    +------------------+    +------------------+
```

### 后端架构

后端采用 Python FastAPI 框架，主要负责：
1. 从 PostgreSQL 数据库读取股票/指数数据
2. 提供 RESTful API 接口供前端调用
3. 数据处理和转换

### 前端架构

前端采用 React 框架，主要负责：
1. 展示股票/指数列表
2. 绘制 K 线图
3. 用户交互界面

## 技术栈

### 后端技术栈

| 技术/库 | 版本 | 用途 |
|---------|------|------|
| Python | 3.9+ | 编程语言 |
| FastAPI | 0.95+ | Web 框架，提供高性能 API |
| SQLAlchemy | 2.0+ | ORM 框架，操作数据库 |
| Pandas | 2.0+ | 数据处理和分析 |
| Pydantic | 2.0+ | 数据验证和设置管理 |
| Uvicorn | 0.20+ | ASGI 服务器 |
| psycopg2-binary | 2.9+ | PostgreSQL 数据库驱动 |

### 前端技术栈

| 技术/库 | 版本 | 用途 |
|---------|------|------|
| React | 18+ | 前端框架 |
| Axios | 1.3+ | HTTP 客户端，用于 API 调用 |
| ECharts | 5.4+ | 图表库，用于绘制 K 线图 |
| Ant Design | 5.0+ | UI 组件库 |
| React Router | 6.0+ | 前端路由 |

## 项目结构

```
StockVisualizer/
├── backend/                  # 后端代码
│   ├── api/                  # API 接口定义
│   ├── database/             # 数据库连接和查询
│   ├── models/               # 数据模型定义
│   ├── services/             # 业务逻辑服务
│   ├── utils/                # 工具函数
│   ├── config/               # 配置文件
│   ├── main.py               # 主入口文件
│   └── requirements.txt      # 依赖列表
│
├── frontend/                 # 前端代码
│   ├── public/               # 静态资源
│   └── src/                  # 源代码
│       ├── components/       # 组件
│       ├── pages/            # 页面
│       ├── services/         # API 服务
│       ├── utils/            # 工具函数
│       ├── App.js            # 应用入口
│       └── index.js          # 主入口文件
│
├── docs/                     # 文档
├── deployment/               # 部署配置
└── README.md                 # 项目说明
```

## 核心功能

1. **股票/指数数据展示**
   - 从 API 获取股票/指数列表
   - 展示股票/指数的基本信息（代码、名称、最新价格等）
   - 支持分页和搜索

2. **K 线图展示**
   - 点击股票/指数后展示其 K 线图
   - 支持不同时间周期的切换（日 K、周 K、月 K）
   - 支持缩放和拖动

3. **数据导出**
   - 支持将数据导出为 CSV 或 Excel 格式

## 数据流

1. 后端从 PostgreSQL 数据库读取 `stock_daily_data` 和 `index_daily_data` 表的数据
2. 后端将数据转换为 DataFrame 进行处理
3. 前端通过 API 请求获取数据
4. 前端将数据渲染为列表和 K 线图

## API 设计

### 股票 API

```
GET /api/stocks               # 获取股票列表
GET /api/stocks/{symbol}      # 获取单只股票基本信息
GET /api/stocks/{symbol}/kline # 获取股票 K 线数据
```

### 指数 API

```
GET /api/indices              # 获取指数列表
GET /api/indices/{symbol}     # 获取单个指数基本信息
GET /api/indices/{symbol}/kline # 获取指数 K 线数据
```

## 实施步骤

1. **环境设置**
   - 安装 Python 和 Node.js
   - 设置 PostgreSQL 数据库连接

2. **后端开发**
   - 实现数据库连接和查询
   - 开发 API 接口
   - 实现数据处理逻辑

3. **前端开发**
   - 实现股票/指数列表组件
   - 实现 K 线图组件
   - 整合前端页面

4. **测试和部署**
   - 单元测试和集成测试
   - Docker 容器化
   - 部署到生产环境

## 部署方案

系统支持通过 Docker 和 Docker Compose 进行部署：

```yaml
# docker-compose.yml 示例
version: '3'

services:
  backend:
    build:
      context: .
      dockerfile: deployment/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://username:password@db:5432/stockdb
    depends_on:
      - db

  frontend:
    build:
      context: .
      dockerfile: deployment/Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=username
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=stockdb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 开发指南

### 后端开发

1. 进入后端目录：
   ```bash
   cd StockVisualizer/backend
   ```

2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

3. 运行开发服务器：
   ```bash
   uvicorn main:app --reload
   ```

### 前端开发

1. 进入前端目录：
   ```bash
   cd StockVisualizer/frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 运行开发服务器：
   ```bash
   npm start
   ```

## 注意事项

- 确保 PostgreSQL 数据库中已有 `stock_daily_data` 和 `index_daily_data` 表
- 前端开发需要 Node.js 14.0+ 环境
- 后端开发需要 Python 3.9+ 环境
```