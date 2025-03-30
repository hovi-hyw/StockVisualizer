# 股票数据可视化应用部署指南

## 环境要求
- Python 3.8 或更高版本
- PostgreSQL 17 或更高版本
- Node.js 22 或更高版本（前端需要）
- Git

## 系统要求
- CPU：至少 2 核
- 内存：至少 4GB
- 存储空间：至少 20GB
- 操作系统：Linux/Windows Server 2019 或更高版本

## 后端部署

### 1. 数据库配置
```bash
# 创建 PostgreSQL 数据库
createdb stock_visualizer

# 创建数据库用户
createuser -P stock_user
```

### 2. 环境变量配置
在后端目录创建 `.env` 文件：
```env
# 数据库配置
DATABASE_URL=postgresql://stock_user:password@localhost:5432/stock_visualizer

# API 配置
API_KEY=your_api_key
API_SECRET=your_api_secret

# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Redis 配置（可选，用于缓存）
REDIS_URL=redis://localhost:6379/0
```

### 3. 后端安装
```bash
# 创建并激活虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 运行数据库迁移
alembic upgrade head
```

### 4. 运行后端
```bash
# 开发环境
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 生产环境（使用 Gunicorn）
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## 前端部署

### 1. 环境变量配置
在前端目录创建 `.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

### 2. 前端安装
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 3. 运行前端
```bash
# 开发环境
npm run dev

# 生产环境（使用 serve）
npm install -g serve
serve -s dist
```

## 生产环境部署

### 使用 Docker（推荐）

1. 构建 Docker 镜像：
```bash
# 构建后端
docker build -t stock-visualizer-backend -f backend/Dockerfile .

# 构建前端
docker build -t stock-visualizer-frontend -f frontend/Dockerfile .
```

2. 使用 Docker Compose 运行：
```bash
docker-compose up -d
```

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

### 更新流程
1. 拉取最新代码：
```bash
git pull origin main
```

2. 更新依赖：
```bash
# 后端
pip install -r requirements.txt

# 前端
npm install
```

3. 应用数据库迁移：
```bash
alembic upgrade head
```

4. 重新构建并重启服务：
```bash
docker-compose down
docker-compose up -d --build
```

## 安全配置

1. 使用 Let's Encrypt 启用 HTTPS：
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. 配置防火墙：
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. 定期安全更新：
```bash
sudo apt-get update
sudo apt-get upgrade
```

## 故障排除

### 常见问题

1. 数据库连接问题
- 检查 PostgreSQL 服务状态
- 验证数据库凭据
- 检查网络连接

2. API 连接问题
- 验证 API 密钥
- 检查防火墙设置
- 验证 SSL 证书

3. 性能问题
- 监控系统资源
- 检查数据库索引
- 查看应用日志

### 技术支持
如需技术支持，请联系：
- 邮箱：support@stock-visualizer.com
- 文档：https://docs.stock-visualizer.com
