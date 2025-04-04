# 开发环境 Dockerfile - 支持实时代码更新
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY ./frontend/package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm install && \
    npm cache clean --force

# 不复制源代码，将通过卷挂载实现
# 在docker-compose.yml中设置卷挂载

# 暴露端口 - React开发服务器默认端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "start"]