# 环境配置指南

## 自动环境检测功能

为了解决在本地环境和Docker环境之间切换时需要修改`.env`文件的问题，我们实现了一个自动环境检测功能。这个功能会根据运行环境自动选择正确的数据库连接字符串。

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

#### 方法1：使用环境变量

您可以在`.env`文件中设置以下环境变量：

```env
# 数据库连接信息
DB_USER=si
DB_PASSWORD=jojo
DB_NAME=stock_db

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
      # 或者
      # - DATABASE_URL=postgresql://custom_user:custom_password@custom_host:5432/custom_db
```

### 注意事项

- 如果您的Docker环境中数据库主机名不是`pgdb`，您可以通过设置环境变量`DATABASE_URL`来覆盖自动检测的结果
- 如果您在本地环境中使用的数据库主机名不是`localhost`，同样可以通过设置环境变量`DATABASE_URL`来覆盖