# backend/api/etf_api.py
"""
此模块定义了ETF数据相关的API端点。
提供获取ETF列表、ETF详情和K线数据的API接口。
Authors: hovi.hyw & AI
Date: 2025-03-25
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, Dict, Any, List

from backend.database.connection import get_db
from backend.models.etf_model import ETFInfo, ETFKlineData, ETFList
from backend.services.etf_service import ETFService
from backend.utils.date_utils import parse_date

router = APIRouter(prefix="/etfs", tags=["etfs"])
etf_service = ETFService()


@router.get("", response_model=Dict[str, Any])
async def get_etf_list(
        page: int = Query(1, description="页码，默认为1"),
        page_size: int = Query(20, description="每页数量，默认为20"),
        search: Optional[str] = Query(None, description="搜索关键词"),
        db: Session = Depends(get_db)
):
    """
    获取ETF列表。

    Args:
        page: 页码，默认为1
        page_size: 每页数量，默认为20
        search: 搜索关键词，默认为None
        db: 数据库会话

    Returns:
        Dict[str, Any]: 包含ETF列表、总数和分页信息的字典
    """
    try:
        result = etf_service.get_etf_list(db, page, page_size, search)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}", response_model=ETFInfo)
async def get_etf_info(
        symbol: str,
        db: Session = Depends(get_db)
):
    """
    获取ETF详情信息。

    Args:
        symbol: ETF代码
        db: 数据库会话

    Returns:
        ETFInfo: ETF详情信息
    """
    try:
        etf_info = etf_service.get_etf_info(db, symbol)
        if not etf_info:
            raise HTTPException(status_code=404, detail=f"ETF with symbol {symbol} not found")
        return etf_info
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/kline", response_model=ETFKlineData)
async def get_etf_kline(
        symbol: str,
        start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
        db: Session = Depends(get_db)
):
    """
    获取ETF K线数据。

    Args:
        symbol: ETF代码
        start_date: 开始日期，格式为YYYY-MM-DD
        end_date: 结束日期，格式为YYYY-MM-DD
        db: 数据库会话

    Returns:
        ETFKlineData: ETF K线数据
    """
    try:
        # 解析日期
        start = parse_date(start_date) if start_date else None
        end = parse_date(end_date) if end_date else None
        
        # 获取K线数据
        kline_data = etf_service.get_etf_kline(db, symbol, start, end)
        return kline_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))