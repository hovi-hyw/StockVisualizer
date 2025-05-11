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
from typing import Optional, Dict, Any

from backend.database.connection import get_db
from backend.models.index_model import IndexList, IndexInfo, IndexKlineData
from backend.services.index_service import IndexService
from backend.utils.date_utils import parse_date

router = APIRouter(prefix="/indices", tags=["indices"])
index_service = IndexService()


@router.get("/", response_model=IndexList)
async def get_indices(
        cursor: Optional[str] = Query(None, description="分页游标"),
        page: Optional[int] = Query(None, ge=1, description="页码，从1开始"),
        page_size: int = Query(20, ge=1, le=100, description="每页数量"),
        search: Optional[str] = Query(None, description="搜索关键字"),
        db: Session = Depends(get_db)
):
    """
    获取指数列表。

    Args:
        cursor: 分页游标，用于获取下一页或上一页数据
        page: 页码，从1开始，与cursor互斥，优先使用page
        page_size: 每页数量，默认20
        search: 搜索关键字，可搜索指数代码或名称
        db: 数据库会话

    Returns:
        IndexList: 指数列表和分页信息
    """
    try:
        # 确保search参数是字符串类型
        search_str = str(search) if search is not None else None
        return index_service.get_index_list(db, page_size, cursor, search_str, page)
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


# 注意：此端点已被移除，因为/indices/{symbol}/kline接口已经包含了所有需要的数据，包括change_rate和reference_change_rate
# 前端应直接使用kline接口返回的数据计算对比涨跌（change_rate减去reference_change_rate）
# 此注释仅作为开发参考，可在确认前端不再使用此接口后删除
