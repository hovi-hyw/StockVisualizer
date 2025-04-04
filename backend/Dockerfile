# 开发环境 Dockerfile - 支持实时代码更新
FROM python:3.13-slim

# 设置工作目录
WORKDIR /app

# 复制requirements文件
COPY ./backend/requirements.txt /app/

# 安装依赖
RUN pip install --no-cache-dir --upgrade pip setuptools>=70.0.0 wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    # 安装开发工具，支持热重载
    pip install --no-cache-dir watchfiles

# 不复制项目文件，将通过卷挂载实现
# 在docker-compose.yml中设置卷挂载

# 设置环境变量
ENV PYTHONPATH=/app \
    DEBUG=True \
    PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 8000

# 启动应用 - 使用--reload参数实现热重载
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]