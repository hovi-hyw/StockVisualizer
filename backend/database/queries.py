# backend/database/queries.py
"""
此模块包含与数据库交互的SQL查询和函数。
提供了获取股票和指数数据的查询功能。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import date, timedelta

from backend.models.stock_model import StockData
from backend.models.index_model import IndexData


def get_stock_list(db: Session, page: int = 1, page_size: int = 20, search: str | None = None):
    # 基础查询
    base_query = """
    SELECT DISTINCT symbol, 
           first_value(close) OVER (PARTITION BY symbol ORDER BY date DESC) as latest_price
    FROM daily_stock
    """
    count_base_query = "SELECT COUNT(DISTINCT symbol) FROM daily_stock"

    params = {}

    # 添加搜索条件
    if search:
        base_query += " WHERE symbol LIKE :search"
        count_base_query += " WHERE symbol LIKE :search"
        params['search'] = f"%{search}%"

    # 添加分页
    offset = (page - 1) * page_size
    query = text(base_query + f" LIMIT {page_size} OFFSET {offset}")
    count_query = text(count_base_query)

    # 执行查询
    stocks = pd.read_sql(query, db.bind, params=params)
    total = db.execute(count_query, params).scalar()

    return {
        "items": stocks.to_dict(orient="records"),
        "total": total,
        "page": page,
        "page_size": page_size
    }


def get_index_list(db: Session, page: int = 1, page_size: int = 20, search: str | None = None):
    # 基础查询
    query = """
    SELECT DISTINCT symbol,
           first_value(close) OVER (PARTITION BY symbol ORDER BY date DESC) as latest_price
    FROM daily_index
    """
    count_query = "SELECT COUNT(DISTINCT symbol) FROM daily_index"

    params = {}

    # 添加搜索条件 - 使用参数化查询
    if search:
        query += " WHERE symbol LIKE :search"
        count_query += " WHERE symbol LIKE :search"
        params['search'] = f"%{search}%"

    # 添加分页
    offset = (page - 1) * page_size
    query += f" LIMIT {page_size} OFFSET {offset}"

    # 执行查询
    indices = pd.read_sql(text(query), db.bind, params=params)
    total = db.execute(text(count_query), params=params).scalar()

    return {
        "items": indices.to_dict(orient="records"),
        "total": total,
        "page": page,
        "page_size": page_size
    }

def get_stock_kline_data(db: Session, symbol: str, start_date: date = None, end_date: date = None):
    """
    获取股票K线数据。

    Args:
        db (Session): 数据库会话
        symbol (str): 股票代码
        start_date (date, optional): 开始日期，默认为None（获取所有数据）
        end_date (date, optional): 结束日期，默认为None（获取所有数据）

    Returns:
        list: 股票K线数据列表
    """
    # 构建查询
    query = """
    SELECT symbol, date, open, close, high, low, volume, amount, outstanding_share, turnover
    FROM daily_stock
    WHERE symbol = :symbol
    """
    
    # 如果提供了日期范围，添加日期条件
    params = {"symbol": symbol}
    if start_date and end_date:
        query += " AND date BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date
        params["end_date"] = end_date
    
    query += " ORDER BY date"

    # 执行查询
    kline_data = pd.read_sql(text(query), db.bind, params=params)

    # 转换为适合ECharts的格式
    result = []
    for _, row in kline_data.iterrows():
        result.append({
            "date": row["date"].strftime("%Y-%m-%d"),
            "open": float(row["open"]),
            "close": float(row["close"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "volume": float(row["volume"]),
            "amount": float(row["amount"]) if pd.notna(row["amount"]) else None,
            "outstanding_share": float(row["outstanding_share"]) if pd.notna(row["outstanding_share"]) else None,
            "turnover": float(row["turnover"]) if pd.notna(row["turnover"]) else None
        })

    return result


def get_index_kline_data(db: Session, symbol: str, start_date: date = None, end_date: date = None):
    """
    获取指数K线数据。

    Args:
        db (Session): 数据库会话
        symbol (str): 指数代码
        start_date (date, optional): 开始日期，默认为None（获取所有数据）
        end_date (date, optional): 结束日期，默认为None（获取所有数据）

    Returns:
        list: 指数K线数据列表
    """
    # 构建查询
    query = f"""
    SELECT symbol, date, open, close, high, low, volume, amount, 
           amplitude, change_rate, change_amount, turnover_rate
    FROM daily_index
    WHERE symbol = '{symbol}'
    """
    
    # 如果提供了日期范围，添加日期条件
    params = {"symbol": symbol}
    if start_date and end_date:
        query += " AND date BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date
        params["end_date"] = end_date
    
    query += " ORDER BY date"

    # 执行查询
    kline_data = pd.read_sql(text(query), db.bind, params=params)

    # 转换为适合ECharts的格式
    result = []
    for _, row in kline_data.iterrows():
        result.append({
            "date": row["date"].strftime("%Y-%m-%d"),
            "open": float(row["open"]),
            "close": float(row["close"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "volume": float(row["volume"]),
            "amount": float(row["amount"]) if pd.notna(row["amount"]) else None,
            "amplitude": float(row["amplitude"]) if pd.notna(row["amplitude"]) else None,
            "change_rate": float(row["change_rate"]) if pd.notna(row["change_rate"]) else None,
            "change_amount": float(row["change_amount"]) if pd.notna(row["change_amount"]) else None,
            "turnover_rate": float(row["turnover_rate"]) if pd.notna(row["turnover_rate"]) else None
        })

    return result


def get_stock_info(db: Session, symbol: str):
    """
    获取股票基本信息。

    Args:
        db (Session): 数据库会话
        symbol (str): 股票代码

    Returns:
        dict: 股票基本信息

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> def get_info(db: Session, symbol: str):
        >>>     return get_stock_info(db, symbol)
    """
    # 首先从stock_info表获取股票名称
    name_query = """
    SELECT name
    FROM stock_info
    WHERE symbol = :symbol
    LIMIT 1
    """
    name_result = pd.read_sql(text(name_query), db.bind, params={"symbol": symbol})
    stock_name = name_result.iloc[0]['name'] if not name_result.empty else None

    # 从daily_stock表获取最新数据
    query = """
    SELECT symbol, 
           date as latest_date,
           open,
           close,
           high,
           low,
           volume,
           amount,
           outstanding_share,
           turnover
    FROM daily_stock
    WHERE symbol = :symbol
    ORDER BY date DESC
    LIMIT 1
    """

    result = pd.read_sql(text(query), db.bind, params={"symbol": symbol})
    if result.empty:
        return None

    stock_info = result.iloc[0].to_dict()
    stock_info['name'] = stock_name
    return stock_info

def get_index_info(db: Session, symbol: str):
    """
    获取指数基本信息。

    Args:
        db (Session): 数据库会话
        symbol (str): 指数代码

    Returns:
        dict: 指数基本信息
    """
    # 首先从index_info表获取指数名称
    name_query = """
    SELECT name
    FROM index_info
    WHERE symbol = :symbol
    LIMIT 1
    """
    name_result = pd.read_sql(text(name_query), db.bind, params={"symbol": symbol})
    index_name = name_result.iloc[0]['name'] if not name_result.empty else None

    # 从daily_index表获取最新数据
    query = """
    SELECT symbol,
           date as latest_date,
           open,
           close,
           high,
           low,
           volume,
           amount,
           amplitude,
           change_rate,
           change_amount,
           turnover_rate
    FROM daily_index
    WHERE symbol = :symbol
    ORDER BY date DESC
    LIMIT 1
    """

    result = pd.read_sql(text(query), db.bind, params={"symbol": symbol})
    if result.empty:
        return None

    index_info = result.iloc[0].to_dict()
    index_info['name'] = index_name
    return index_info