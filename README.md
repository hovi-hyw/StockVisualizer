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

1. 后端从 PostgreSQL 数据库读取 `daily_stock` 和 `daily_index` 表的数据
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

**参数说明**
- `page`: 页码，默认为1
- `page_size`: 每页数量，默认为20，最大为100
- `search`: 搜索关键字，可搜索股票代码或名称
- `start_date`: 开始日期（YYYY-MM-DD），可选
- `end_date`: 结束日期（YYYY-MM-DD），可选

### 指数 API

```
GET /api/indices              # 获取指数列表
GET /api/indices/{symbol}     # 获取单个指数基本信息
GET /api/indices/{symbol}/kline # 获取指数 K 线数据
```

**参数说明**
- `page`: 页码，默认为1
- `page_size`: 每页数量，默认为20，最大为100
- `search`: 搜索关键字，可搜索指数代码或名称
- `start_date`: 开始日期（YYYY-MM-DD），可选
- `end_date`: 结束日期（YYYY-MM-DD），可选

## 环境要求

- Python 3.9 或更高版本
- PostgreSQL 17 或更高版本
- Node.js 22 或更高版本（前端需要）
- Docker 和 Docker Compose（推荐部署方式）

### 系统要求
- CPU：至少 2 核
- 内存：至少 4GB
- 存储空间：至少 20GB
- 操作系统：Linux/Windows Server 2019 或更高版本

## 环境配置

### 环境变量配置

系统支持在不同环境（本地开发、Docker容器、生产环境）之间无缝切换，通过自动环境检测功能简化配置过程。

#### 自动环境检测功能

系统会通过以下方式检测当前的运行环境：

1. 检查是否存在`/.dockerenv`文件（Docker容器内部特有的文件）
2. 检查环境变量`DOCKER_CONTAINER`是否设置为`true`

根据检测结果：
- 如果在Docker环境中运行，将使用`pgdb`作为数据库主机名
- 如果在本地环境中运行，将使用`localhost`作为数据库主机名

#### 配置方法

1. 复制项目根目录下的`.env.example`文件为`.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑`.env`文件，设置以下环境变量：
   ```env
   # 数据库连接信息
   DB_USER=DB_USER
   DB_PASSWORD=DB_PASSWORD
   DB_NAME=stock_db
   DB_PORT=5432
   
   # API配置
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG=True
   
   # 日志级别
   LOG_LEVEL=INFO
   
   # 前端API基础URL（用于前端开发）
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   ```

## 开发环境配置

我们提供了两种开发环境配置方式：使用Docker容器化环境和本地直接运行。两种方式都支持代码热重载，方便开发和调试。

### 使用Docker开发（推荐）

#### 前提条件

- 安装 [Docker](https://www.docker.com/get-started)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

#### 启动开发环境

在项目根目录下运行以下命令：

```bash
# 使用开发环境配置启动
docker-compose -f deployment/docker-compose.dev.yml up
```

这将启动：
- 前端开发服务器 (React) - 访问 http://localhost:3000
- 后端API服务器 (FastAPI) - 访问 http://localhost:8000

#### 代码实时更新

开发环境配置已经设置了卷挂载，当你修改本地代码时：

- **前端代码**：React开发服务器会自动检测变化并重新编译，浏览器会自动刷新
- **后端代码**：uvicorn服务器使用`--reload`参数，会自动检测Python文件变化并重启服务

#### 开发环境注意事项

1. **首次构建**：首次启动可能需要较长时间，因为需要安装所有依赖

   ```bash
   # 强制重新构建镜像
   docker-compose -f deployment/docker-compose.dev.yml up --build
   ```

2. **依赖管理**：
   - 如果添加了新的前端依赖，需要重新构建前端容器
   - 如果添加了新的后端依赖，需要更新`requirements.txt`并重新构建后端容器

3. **环境变量**：
   - 开发环境使用项目根目录下的`.env`文件
   - 确保该文件包含所有必要的环境变量

4. **网络问题**：
   - 如果前端无法连接后端API，检查`REACT_APP_API_URL`环境变量设置
   - 确保`stock_network`网络已创建

### 本地直接运行开发环境

如果你不想使用Docker，可以直接在本地运行前后端服务。这种方式需要你在本地安装所有依赖。

#### 前提条件

- 安装 [Python](https://www.python.org/downloads/) 3.9+
- 安装 [Node.js](https://nodejs.org/en/download/) 22+
- 安装 [PostgreSQL](https://www.postgresql.org/download/) 17+

#### 配置环境变量

1. 复制项目根目录下的`.env.example`文件为`.env`：
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/macOS
   cp .env.example .env
   ```

2. 编辑`.env`文件，设置数据库连接信息和其他必要的环境变量。确保设置正确的数据库主机名（通常是`localhost`）。

#### 设置数据库

1. 创建PostgreSQL数据库：
   ```sql
   CREATE DATABASE stock_db;
   ```

2. 确保在`.env`文件中配置了正确的数据库连接信息。

#### 运行后端服务

1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 创建并激活虚拟环境（可选但推荐）：
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Linux/macOS
   python -m venv venv
   source venv/bin/activate
   ```

3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

4. 运行后端服务：
   ```bash
   # 使用uvicorn启动FastAPI应用
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

   本地运行的时候使用：
   ```bash
   # 使用uvicorn启动FastAPI应用
   python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. 后端服务将在 http://localhost:8000 运行，API文档可在 http://localhost:8000/docs 访问。

#### 运行前端服务

1. 进入前端目录：
   ```bash
   cd frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 运行前端开发服务器：
   ```bash
   npm start
   ```

4. 前端应用将在 http://localhost:3000 运行。

#### 本地开发注意事项

1. **环境变量**：确保`.env`文件中的`REACT_APP_API_BASE_URL`设置为`http://localhost:8000/api`，以便前端能够正确连接后端API。

2. **数据库连接**：确保PostgreSQL服务正在运行，并且可以使用`.env`文件中配置的凭据连接。

3. **代码热重载**：
   - 后端：uvicorn的`--reload`参数会监视代码变化并自动重启服务
   - 前端：React开发服务器会自动检测变化并重新编译

4. **跨域问题**：如果遇到跨域问题，确保后端的CORS设置正确，允许来自前端开发服务器的请求。

## 部署指南

### 使用 Docker（推荐）

1. 确保安装了Docker和Docker Compose：
```bash
# 检查Docker版本
docker --version

# 检查Docker Compose版本
docker-compose --version
```

2. 配置环境变量：
   - 复制项目根目录下的`.env.example`文件为`.env`
   - 根据实际情况修改环境变量，特别是数据库连接信息

3. 使用Docker Compose构建和运行：
```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

4. 访问应用：
   - 前端：http://localhost:3000
   - 后端API：http://localhost:8000
   - API文档：http://localhost:8000/docs

### 使用 Nginx 作为反向代理

1. 安装 Nginx：
```bash
sudo apt-get update
sudo apt-get install nginx
```

2. 配置 Nginx：
```nginx
# /etc/nginx/sites-available/stock-visualizer
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. 启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/stock-visualizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 使用指南

### 股票列表查看

1. 访问首页或股票页面查看股票列表
2. 使用搜索框可按股票代码或名称搜索
3. 点击分页按钮浏览更多股票
4. 点击股票行可查看详细K线图

### K线图操作

1. 在K线图界面可查看股票/指数的历史价格走势
2. 支持以下操作：
   - 鼠标滚轮：缩放K线图
   - 鼠标拖动：平移K线图
   - 时间周期切换：切换日K/周K/月K
   - 十字光标：显示某一时间点的详细价格信息
3. 图表右上角提供额外工具：
   - 数据区间选择
   - 指标叠加（MA、MACD等）
   - 导出图表为图片

### 数据导出

1. 在股票列表或K线图页面，点击"导出数据"按钮
2. 选择导出格式（CSV或Excel）
3. 选择导出数据范围
4. 确认导出

## 监控和维护

### 日志管理
- 后端日志：`/var/log/stock-visualizer/backend.log`
- 前端日志：`/var/log/stock-visualizer/frontend.log`
- Nginx 日志：`/var/log/nginx/access.log` 和 `/var/log/nginx/error.log`

### 数据备份
```bash
# 数据库备份
pg_dump -U stock_user stock_visualizer > backup.sql

# 配置文件备份
tar -czf config_backup.tar.gz .env nginx.conf
```