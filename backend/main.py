# backend/main.py
"""
此模块是后端应用程序的入口点。
创建FastAPI应用，注册路由，配置中间件等。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from api.router import api_router
from config.settings import settings
from database.connection import engine, Base

# 配置日志
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("stock-visualizer")

# 创建应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="股票数据可视化系统API",
    version="1.0.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    """
    应用启动时执行的事件。
    创建数据库表（如果不存在）。
    """
    logger.info("Starting up the application...")
    # 创建数据库表（如果不存在）
    # 注意：在生产环境中，应该使用数据库迁移工具
    # Base.metadata.create_all(bind=engine)


@app.on_event("shutdown")
async def shutdown_event():
    """
    应用关闭时执行的事件。
    """
    logger.info("Shutting down the application...")


@app.get("/")
async def root():
    """
    根路径处理函数。
    返回应用基本信息。

    Returns:
        dict: 应用信息
    """
    return {
        "app_name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "message": "Welcome to Stock Visualizer API",
    }


@app.get("/health")
async def health_check():
    """
    健康检查端点。

    Returns:
        dict: 健康状态
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)