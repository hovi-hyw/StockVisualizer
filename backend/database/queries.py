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
    FROM stock_daily_data
    """
    count_base_query = "SELECT COUNT(DISTINCT symbol) FROM stock_daily_data"

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
    """
    获取指数列表。

    Args:
        db (Session): 数据库会话
        page (int): 页码，默认为1
        page_size (int): 每页数量，默认为20
        search (str, optional): 搜索关键字，可搜索指数代码或名称

    Returns:
        dict: 包含指数列表和总数的字典

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> def get_indices(db: Session):
        >>>     return get_index_list(db, page=1, page_size=10)
    """
    # 基础查询
    query = """
    SELECT DISTINCT symbol, name,
           first_value(close) OVER (PARTITION BY symbol ORDER BY date DESC) as latest_price
    FROM index_daily_data
    """
    count_query = "SELECT COUNT(DISTINCT symbol) FROM index_daily_data"

    # 添加搜索条件
    if search:
        query += f" WHERE symbol LIKE '%{search}%' OR name LIKE '%{search}%'"
        count_query += f" WHERE symbol LIKE '%{search}%' OR name LIKE '%{search}%'"

    # 添加分页
    offset = (page - 1) * page_size
    query += f" LIMIT {page_size} OFFSET {offset}"

    # 执行查询
    indices = pd.read_sql(query, db.bind)
    total = db.execute(text(count_query)).scalar()

    return {
        "items": indices.to_dict(orient="records"),
        "total": total,
        "page": page,
        "page_size": page_size
    }


def get_stock_kline_data(db: Session, symbol: str, start_date: date, end_date: date):
    """
    获取股票K线数据。

    Args:
        db (Session): 数据库会话
        symbol (str): 股票代码
        start_date (date, optional): 开始日期，默认为一年前
        end_date (date, optional): 结束日期，默认为今天

    Returns:
        list: 股票K线数据列表

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> from datetime import date, timedelta
        >>> def get_kline(db: Session, symbol: str):
        >>>     end_date = date.today()
        >>>     start_date = end_date - timedelta(days=365)
        >>>     return get_stock_kline_data(db, symbol, start_date, end_date)
    """
    # 设置默认日期范围
    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=365)

    # 构建查询
    query = f"""
    SELECT symbol, date, open, close, high, low, volume, amount, outstanding_share, turnover
    FROM stock_daily_data
    WHERE symbol = '{symbol}' AND date BETWEEN '{start_date}' AND '{end_date}'
    ORDER BY date
    """

    # 执行查询
    kline_data = pd.read_sql(query, db.bind)

    # 转换为适合ECharts的格式
    result = []
    for _, row in kline_data.iterrows():
        result.append({
            "date": pd.to_datetime(row["date"]).strftime("%Y-%m-%d"),
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
        start_date (date, optional): 开始日期，默认为一年前
        end_date (date, optional): 结束日期，默认为今天

    Returns:
        list: 指数K线数据列表

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> from datetime import date, timedelta
        >>> def get_kline(db: Session, symbol: str):
        >>>     end_date = date.today()
        >>>     start_date = end_date - timedelta(days=365)
        >>>     return get_index_kline_data(db, symbol, start_date, end_date)
    """
    # 设置默认日期范围
    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=365)

    # 构建查询
    query = f"""
    SELECT symbol, name, date, open, close, high, low, volume, amount, 
           amplitude, change_rate, change_amount, turnover_rate
    FROM index_daily_data
    WHERE symbol = '{symbol}' AND date BETWEEN '{start_date}' AND '{end_date}'
    ORDER BY date
    """

    # 执行查询
    kline_data = pd.read_sql(query, db.bind)

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
    query = f"""
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
    FROM stock_daily_data
    WHERE symbol = '{symbol}'
    ORDER BY date DESC
    LIMIT 1
    """

    result = pd.read_sql(query, db.bind)
    if result.empty:
        return None

    return result.iloc[0].to_dict()


# backend/database/queries.py (继续)
def get_index_info(db: Session, symbol: str):
    """
    获取指数基本信息。

    Args:
        db (Session): 数据库会话
        symbol (str): 指数代码

    Returns:
        dict: 指数基本信息

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> def get_info(db: Session, symbol: str):
        >>>     return get_index_info(db, symbol)
    """
    query = f"""
    SELECT symbol, name,
           MAX(date) as latest_date,
           first_value(open) OVER (PARTITION BY symbol ORDER BY date DESC) as open,
           first_value(close) OVER (PARTITION BY symbol ORDER BY date DESC) as close,
           first_value(high) OVER (PARTITION BY symbol ORDER BY date DESC) as high,
           first_value(low) OVER (PARTITION BY symbol ORDER BY date DESC) as low,
           first_value(volume) OVER (PARTITION BY symbol ORDER BY date DESC) as volume,
           first_value(amount) OVER (PARTITION BY symbol ORDER BY date DESC) as amount,
           first_value(amplitude) OVER (PARTITION BY symbol ORDER BY date DESC) as amplitude,
           first_value(change_rate) OVER (PARTITION BY symbol ORDER BY date DESC) as change_rate,
           first_value(change_amount) OVER (PARTITION BY symbol ORDER BY date DESC) as change_amount,
           first_value(turnover_rate) OVER (PARTITION BY symbol ORDER BY date DESC) as turnover_rate
    FROM index_daily_data
    WHERE symbol = '{symbol}'
    GROUP BY symbol, name
    """

    result = pd.read_sql(query, db.bind)
    if result.empty:
        return None

    return result.iloc[0].to_dict()