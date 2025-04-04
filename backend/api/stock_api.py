# backend/api/stock_api.py
"""
此模块定义了股票数据相关的API端点。
提供获取股票列表、股票详情和K线数据的API接口。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from backend.database.connection import get_db
from backend.models.stock_model import StockList, StockInfo, StockKlineData
from backend.services.stock_service import StockService
from backend.utils.date_utils import parse_date

router = APIRouter(prefix="/stocks", tags=["stocks"])
stock_service = StockService()


@router.get("/", response_model=StockList)
async def get_stocks(
        cursor: Optional[str] = Query(None, description="分页游标"),
        page: Optional[int] = Query(None, ge=1, description="页码，从1开始"),
        page_size: int = Query(20, ge=1, le=100, description="每页数量"),
        search: Optional[str] = Query(None, description="搜索关键字"),
        db: Session = Depends(get_db)
):
    """
    获取股票列表。

    Args:
        cursor: 分页游标，用于获取下一页或上一页数据
        page: 页码，从1开始，与cursor互斥，优先使用page
        page_size: 每页数量，默认20
        search: 搜索关键字，可搜索股票代码
        db: 数据库会话

    Returns:
        StockList: 股票列表和分页信息
    """
    try:
        # 确保search参数是字符串类型
        search_str = str(search) if search is not None else None
        return stock_service.get_stock_list(db, page_size, cursor, search_str, page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}", response_model=StockInfo)
async def get_stock_info(
        symbol: str,
        db: Session = Depends(get_db)
):
    """
    获取股票详情信息。

    Args:
        symbol: 股票代码
        db: 数据库会话

    Returns:
        StockInfo: 股票详情信息
    """
    try:
        stock_info = stock_service.get_stock_info(db, symbol)
        if not stock_info:
            raise HTTPException(status_code=404, detail=f"Stock with symbol {symbol} not found")
        return stock_info
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/kline", response_model=StockKlineData)
async def get_stock_kline(
        symbol: str,
        start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
        db: Session = Depends(get_db)
):
    """
    获取股票K线数据。

    Args:
        symbol: 股票代码
        start_date: 开始日期，格式为YYYY-MM-DD
        end_date: 结束日期，格式为YYYY-MM-DD
        db: 数据库会话

    Returns:
        StockKlineData: 股票K线数据
    """
    try:
        # 解析日期
        start = parse_date(start_date) if start_date else None
        end = parse_date(end_date) if end_date else None

        kline_data = stock_service.get_stock_kline(db, symbol, start, end)
        return kline_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))