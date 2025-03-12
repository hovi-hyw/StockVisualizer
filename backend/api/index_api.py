# backend/api/index_api.py
"""
此模块定义了指数数据相关的API端点。
提供获取指数列表、指数详情和K线数据的API接口。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from backend.database.connection import get_db
from backend.models.index_model import IndexList, IndexInfo, IndexKlineData
from backend.services.index_service import IndexService
from backend.utils.date_utils import parse_date

router = APIRouter(prefix="/indices", tags=["indices"])
index_service = IndexService()


@router.get("/", response_model=IndexList)
async def get_indices(
        page: int = Query(1, ge=1, description="页码"),
        page_size: int = Query(20, ge=1, le=100, description="每页数量"),
        search: Optional[str] = Query(None, description="搜索关键字"),
        db: Session = Depends(get_db)
):
    """
    获取指数列表。

    Args:
        page: 页码，从1开始
        page_size: 每页数量，默认20
        search: 搜索关键字，可搜索指数代码或名称
        db: 数据库会话

    Returns:
        IndexList: 指数列表和分页信息
    """
    try:
        return index_service.get_index_list(db, page, page_size, search)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}", response_model=IndexInfo)
async def get_index_info(
        symbol: str,
        db: Session = Depends(get_db)
):
    """
    获取指数详情信息。

    Args:
        symbol: 指数代码
        db: 数据库会话

    Returns:
        IndexInfo: 指数详情信息
    """
    try:
        index_info = index_service.get_index_info(db, symbol)
        if not index_info:
            raise HTTPException(status_code=404, detail=f"Index with symbol {symbol} not found")
        return index_info
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/kline", response_model=IndexKlineData)
async def get_index_kline(
        symbol: str,
        start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
        db: Session = Depends(get_db)
):
    """
    获取指数K线数据。

    Args:
        symbol: 指数代码
        start_date: 开始日期，格式为YYYY-MM-DD
        end_date: 结束日期，格式为YYYY-MM-DD
        db: 数据库会话

    Returns:
        IndexKlineData: 指数K线数据
    """
    try:
        # 解析日期
        start = parse_date(start_date) if start_date else None
        end = parse_date(end_date) if end_date else None

        kline_data = index_service.get_index_kline(db, symbol, start, end)
        return kline_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))