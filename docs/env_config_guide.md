# 环境配置指南

## 概述

本指南详细说明如何配置股票数据可视化系统的环境变量和数据库连接。系统支持在不同环境（本地开发、Docker容器、生产环境）之间无缝切换，通过自动环境检测功能简化配置过程。

## 自动环境检测功能

为了解决在本地环境和Docker环境之间切换时需要修改`.env`文件的问题，我们实现了一个自动环境检测功能。这个功能会根据运行环境自动选择正确的数据库连接字符串，大大简化了开发和部署流程。

### 工作原理

系统会通过以下方式检测当前的运行环境：

1. 检查是否存在`/.dockerenv`文件（Docker容器内部特有的文件）
2. 检查环境变量`DOCKER_CONTAINER`是否设置为`true`

根据检测结果：
- 如果在Docker环境中运行，将使用`pgdb`作为数据库主机名
- 如果在本地环境中运行，将使用`localhost`作为数据库主机名

### 配置优先级

系统按照以下优先级使用数据库连接信息：

1. 如果设置了环境变量`DATABASE_URL`，则直接使用该值
2. 如果没有设置`DATABASE_URL`，则使用环境变量`DB_USER`、`DB_PASSWORD`、`DB_NAME`的值构建连接字符串
3. 如果上述环境变量也没有设置，则使用默认值：
   - 用户名：`si`
   - 密码：`jojo`
   - 数据库名：`stock_db`

### 使用方法

#### 方法1：使用环境变量文件（推荐）

1. 复制项目根目录下的`.env.example`文件为`.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑`.env`文件，设置以下环境变量：
   ```env
   # 数据库连接信息
   DB_USER=si
   DB_PASSWORD=jojo
   DB_NAME=stock_db
   DB_PORT=5432
   
   # API配置
   API_HOST=0.0.0.0
   API_PORT=8080
   DEBUG=True
   
   # 日志级别
   LOG_LEVEL=INFO
   
   # 前端API基础URL（用于前端开发）
   REACT_APP_API_BASE_URL=http://localhost:8080/api
   
   # 或者直接设置完整的连接字符串（优先级更高）
   # DATABASE_URL=postgresql://si:jojo@localhost:5432/stock_db
   ```

#### 方法2：在Docker环境中覆盖环境变量

如果您需要在Docker环境中使用不同的数据库连接信息，可以在`docker-compose.yml`文件中设置环境变量：

```yaml
services:
  backend:
    # ...
    environment:
      - DB_USER=custom_user
      - DB_PASSWORD=custom_password
      - DB_NAME=custom_db
      - DEBUG=False
      # 或者
      # - DATABASE_URL=postgresql://custom_user:custom_password@db:5432/custom_db
```

#### 方法3：使用操作系统环境变量

在生产环境中，可以直接设置操作系统环境变量：

```bash
# Linux/macOS
export DATABASE_URL=postgresql://user:password@host:5432/dbname
export DEBUG=False

# Windows (PowerShell)
$env:DATABASE_URL = "postgresql://user:password@host:5432/dbname"
$env:DEBUG = "False"
```

### 注意事项

- 如果您的Docker环境中数据库主机名不是`pgdb`，您可以通过设置环境变量`DATABASE_URL`来覆盖自动检测的结果
- 如果您在本地环境中使用的数据库主机名不是`localhost`，同样可以通过设置环境变量`DATABASE_URL`来覆盖
- 生产环境中应使用环境变量而非配置文件存储敏感信息

## 最佳实践

### 开发环境

1. 使用`.env`文件进行本地开发配置
2. 不要将`.env`文件提交到版本控制系统
3. 保持`.env.example`文件更新，作为配置模板
4. 开发时启用DEBUG模式以获取详细错误信息

### 生产环境

1. 使用操作系统环境变量或容器编排工具（如Docker Compose、Kubernetes）管理配置
2. 禁用DEBUG模式
3. 设置适当的日志级别（通常为INFO或WARNING）
4. 使用强密码并定期更换
5. 考虑使用密钥管理服务存储敏感信息

### 常见问题解决

1. **数据库连接失败**
   - 检查数据库服务是否运行
   - 验证用户名和密码是否正确
   - 确认数据库主机名在当前网络环境中可访问
   - Docker环境中使用服务名作为主机名（如`db`）

2. **环境变量未生效**
   - 确认应用程序重启以加载新的环境变量
   - 检查变量名称是否正确（区分大小写）
   - 验证环境变量文件路径是否正确

3. **Docker环境特定问题**
   - 容器间通信使用服务名而非localhost
   - 确保数据库容器在应用容器之前启动（使用`depends_on`）
   - 使用Docker网络进行容器间通信