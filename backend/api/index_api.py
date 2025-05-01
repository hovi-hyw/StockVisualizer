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


@router.get("/{symbol}/real-change", response_model=Dict[str, Any])
async def get_index_real_change(
        symbol: str,
        start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
        db: Session = Depends(get_db)
):
    """
    获取指数真实涨跌数据。

    Args:
        symbol: 指数代码
        start_date: 开始日期，格式为YYYY-MM-DD
        end_date: 结束日期，格式为YYYY-MM-DD
        db: 数据库会话

    Returns:
        Dict[str, Any]: 包含真实涨跌数据的字典
    """
    try:
        # 解析日期
        start = parse_date(start_date) if start_date else None
        end = parse_date(end_date) if end_date else None
        
        # 首先获取K线数据以获取日期列表
        kline_data = index_service.get_index_kline(db, symbol, start, end)
        
        # 查询derived_index表中的real_change数据
        query = """
        SELECT di.symbol, di.date, di.real_change
        FROM derived_index di
        WHERE di.symbol = :symbol
        AND (:start_date IS NULL OR di.date >= :start_date)
        AND (:end_date IS NULL OR di.date <= :end_date)
        ORDER BY di.date
        """
        
        from sqlalchemy import text
        results = db.execute(text(query), {
            "symbol": symbol,
            "start_date": start,
            "end_date": end
        }).fetchall()
        
        if not results:
            # 如果没有找到数据，返回空数据但不报错
            # 这样前端可以继续显示其他数据
            print(f"No data found for index {symbol} in the specified date range")
            return {
                "symbol": symbol,
                "data": []
            }
        
        # 创建日期到real_change的映射
        real_change_map = {}
        used_symbol = None
        
        for result in results:
            used_symbol = result[0]
            date_str = result[1].isoformat() if result[1] else None
            real_change_value = float(result[2]) if result[2] is not None else 0
            if date_str:
                real_change_map[date_str] = real_change_value
        
        # 为每个日期获取对应的real_change值
        data = []
        for item in kline_data["data"]:
            date_str = item["date"]
            # 如果映射中有该日期的数据，使用映射中的值，否则使用0
            real_change = real_change_map.get(date_str, 0)
            data.append({
                "date": date_str,
                "real_change": real_change
            })
        
        return {
            "symbol": symbol,
            "data": data
        }
    except Exception as e:
        # 捕获所有异常但不中断前端显示
        # 记录错误并返回空数据
        print(f"Error getting real change data for index {symbol}: {str(e)}")
        return {
            "symbol": symbol,
            "data": []
        }