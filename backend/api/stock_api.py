# backend/api/stock_api.py
"""
此模块定义了股票数据相关的API端点。
提供获取股票列表、股票详情、K线数据和真实涨跌数据的API接口。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, Dict, Any

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


@router.get("/{symbol}/real-change", response_model=Dict[str, Any])
async def get_stock_real_change(
        symbol: str,
        start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
        db: Session = Depends(get_db)
):
    """
    获取股票真实涨跌数据。

    Args:
        symbol: 股票代码
        start_date: 开始日期，格式为YYYY-MM-DD
        end_date: 结束日期，格式为YYYY-MM-DD
        db: 数据库会话

    Returns:
        Dict[str, Any]: 包含真实涨跌数据和对比涨跌数据的字典
    """
    try:
        # 解析日期
        start = parse_date(start_date) if start_date else None
        end = parse_date(end_date) if end_date else None
        
        # 首先获取K线数据以获取日期列表
        kline_data = stock_service.get_stock_kline(db, symbol, start, end)
        
        # 查询derived_stock表中的real_change数据
        query = """
        SELECT ds.symbol, ds.date, ds.real_change
        FROM derived_stock ds
        WHERE ds.symbol = :symbol
        AND (:start_date IS NULL OR ds.date >= :start_date)
        AND (:end_date IS NULL OR ds.date <= :end_date)
        ORDER BY ds.date
        """
        
        from sqlalchemy import text
        results = db.execute(text(query), {
            "symbol": symbol,
            "start_date": start,
            "end_date": end
        }).fetchall()
        
        if not results:
            # 尝试转换股票代码格式
            if symbol.startswith('sh') or symbol.startswith('sz') or symbol.startswith('bj'):
                # 尝试去掉前缀
                alt_symbol = symbol[2:]
                results = db.execute(text(query), {
                    "symbol": alt_symbol,
                    "start_date": start,
                    "end_date": end
                }).fetchall()
            else:
                # 尝试添加前缀
                for prefix in ['sh', 'sz', 'bj']:
                    alt_symbol = f"{prefix}{symbol}"
                    results = db.execute(text(query), {
                        "symbol": alt_symbol,
                        "start_date": start,
                        "end_date": end
                    }).fetchall()
                    if results:
                        break
        
        if not results:
            raise HTTPException(status_code=404, detail=f"Stock with symbol {symbol} not found in derived_stock table")
        
        # 创建日期到real_change的映射
        real_change_map = {}
        used_symbol = None
        
        for result in results:
            used_symbol = result[0]
            date_str = result[1].isoformat() if result[1] else None
            real_change_value = float(result[2]) if result[2] is not None else 0
            if date_str:
                real_change_map[date_str] = real_change_value
        
        # 获取股票信息，用于查找每年对应的指数代码
        stock_info_query = """
        SELECT symbol, name, index_2020, index_2021, index_2022, index_2023, index_2024
        FROM stock_info
        WHERE symbol = :symbol
        """
        
        stock_info = db.execute(text(stock_info_query), {"symbol": used_symbol or symbol}).fetchone()
        
        if not stock_info:
            # 尝试不同的股票代码格式
            if (used_symbol or symbol).startswith('sh') or (used_symbol or symbol).startswith('sz') or (used_symbol or symbol).startswith('bj'):
                # 尝试去掉前缀
                alt_symbol = (used_symbol or symbol)[2:]
                stock_info = db.execute(text(stock_info_query), {"symbol": alt_symbol}).fetchone()
            else:
                # 尝试添加前缀
                for prefix in ['sh', 'sz', 'bj']:
                    alt_symbol = f"{prefix}{used_symbol or symbol}"
                    stock_info = db.execute(text(stock_info_query), {"symbol": alt_symbol}).fetchone()
                    if stock_info:
                        break
        
        # 为每个日期获取对应的real_change值和对比涨跌值
        data = []
        for item in kline_data["data"]:
            date_str = item["date"]
            date_obj = date.fromisoformat(date_str)
            year = date_obj.year
            
            # 获取该年份对应的指数代码
            index_column = f"index_{year}"
            index_symbol = None
            reference_name = "无参考"
            comparative_change = 0.0
            
            # 如果映射中有该日期的数据，使用映射中的值，否则使用0
            real_change = real_change_map.get(date_str, 0)
            
            # 如果股票信息存在且年份在2020-2024范围内
            if stock_info and 2020 <= year <= 2024:
                # 获取对应年份的指数代码
                index_idx = year - 2020 + 2  # index_2020在位置2，index_2021在位置3，以此类推
                if index_idx < len(stock_info) and stock_info[index_idx]:
                    index_symbol = stock_info[index_idx]
                    
                    # 查询指数的real_change数据
                    index_query = """
                    SELECT di.symbol, di.date, di.real_change, ii.name
                    FROM derived_index di
                    LEFT JOIN index_info ii ON di.symbol = ii.symbol
                    WHERE di.symbol = :index_symbol AND di.date = :date
                    """
                    
                    index_result = db.execute(text(index_query), {
                        "index_symbol": index_symbol,
                        "date": date_obj
                    }).fetchone()
                    
                    if index_result:
                        index_real_change = float(index_result[2]) if index_result[2] is not None else 0
                        comparative_change = real_change - index_real_change
                        reference_name = index_result[3] if index_result[3] else f"指数{index_symbol}"
            
            data.append({
                "date": date_str,
                "real_change": real_change,
                "comparative_change": comparative_change,
                "reference_index": index_symbol or "",
                "reference_name": reference_name
            })
        
        return {
            "symbol": used_symbol or symbol,
            "data": data
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))