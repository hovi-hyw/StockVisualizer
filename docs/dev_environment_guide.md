# StockVisualizer 开发环境配置指南

本文档提供了如何在开发环境中使用Docker配置，实现代码实时更新的功能。

## 开发环境设置

我们提供了专门的开发环境配置，支持代码热重载，方便开发和调试。

### 前提条件

- 安装 [Docker](https://www.docker.com/get-started)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

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

### 注意事项

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

5. **文件权限**：
   - 在某些系统上可能会遇到文件权限问题，特别是挂载卷时
   - 如果遇到权限问题，可能需要调整文件权限或使用不同的用户运行容器

## 切换到生产环境

当需要测试生产环境配置时，使用标准的docker-compose.yml：

```bash
docker-compose -f deployment/docker-compose.yml up
```

生产环境不支持代码热重载，每次代码更改后需要重新构建镜像。