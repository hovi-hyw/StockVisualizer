# backend/api/router.py
"""
此模块定义了API路由的集成。
将所有API路由注册到主应用程序。
Authors: hovi.hyw & AI
Date: 2025-03-12
更新: 2025-04-10 - 添加基金API路由
"""

from fastapi import APIRouter

from backend.api.stock_api import router as stock_router
from backend.api.index_api import router as index_router
from backend.api.market_api import router as market_router
from backend.api.etf_api import router as etf_router
from backend.api.fund_api import router as fund_router

# 创建主路由
api_router = APIRouter()

# 注册子路由
api_router.include_router(stock_router)
api_router.include_router(index_router)
api_router.include_router(market_router)
api_router.include_router(etf_router)
api_router.include_router(fund_router)