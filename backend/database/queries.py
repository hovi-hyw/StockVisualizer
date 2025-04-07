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


def get_stock_list(db: Session, page_size: int = 20, cursor: str | None = None, search: str | None = None, page: int | None = None):
    # 优化基础查询 - 使用子查询获取最新价格、涨跌幅和成交量，并关联股票名称
    base_query = """
    SELECT 
        s.symbol, 
        si.name,
        s.close as latest_price,
        CASE 
            WHEN prev.close IS NOT NULL THEN ((s.close - prev.close) / prev.close * 100)
            ELSE 0 
        END as change_percent,
        s.volume
    FROM (
        SELECT symbol, MAX(date) as max_date
        FROM daily_stock
        GROUP BY symbol
    ) latest
    JOIN daily_stock s ON s.symbol = latest.symbol AND s.date = latest.max_date
    LEFT JOIN stock_info si ON s.symbol = si.symbol
    LEFT JOIN (
        -- 获取前一交易日数据用于计算涨跌幅
        SELECT ds.symbol, ds.close, ds.date
        FROM daily_stock ds
        INNER JOIN (
            SELECT symbol, MAX(date) as prev_date
            FROM daily_stock
            WHERE date < (
                SELECT MAX(date) FROM daily_stock
            )
            GROUP BY symbol
        ) pd ON ds.symbol = pd.symbol AND ds.date = pd.prev_date
    ) prev ON s.symbol = prev.symbol
    """
    count_base_query = "SELECT COUNT(DISTINCT symbol) FROM daily_stock"

    params = {}
    where_clauses = []

    # 添加搜索条件
    if search:
        # 修改搜索条件，同时匹配股票代码和股票名称
        where_clauses.append("(s.symbol LIKE :search OR si.name LIKE :search)")
        params['search'] = f"%{search}%"
        # 同时更新计数查询的搜索条件 - 需要使用JOIN来匹配名称
        count_base_query = """
        SELECT COUNT(DISTINCT ds.symbol) 
        FROM daily_stock ds
        LEFT JOIN stock_info si ON ds.symbol = si.symbol
        WHERE (ds.symbol LIKE :search OR si.name LIKE :search)
        """

    # 组合WHERE子句
    if where_clauses:  # 移除了'and not search'条件，确保搜索条件被正确添加到查询中
        base_query += " WHERE " + " AND ".join(where_clauses)
        
    # 执行计数查询 - 使用缓存变量避免重复计算
    count_query = text(count_base_query)
    try:
        total = db.execute(count_query, params).scalar()
    except Exception as e:
        print(f"计数查询错误: {e}")
        total = 0  # 出错时提供默认值

    # 基于页码的分页 - 优化大页码查询性能
    if page is not None:
        try:
            # 计算偏移量
            offset = (page - 1) * page_size
            
            # 优化大页码查询 - 对于大于3的页码，使用子查询方式避免全表扫描
            if page > 3:
                # 先获取当前页的第一个symbol
                symbol_query = f"""
                SELECT symbol
                FROM (
                    SELECT DISTINCT ds.symbol
                    FROM daily_stock ds
                    LEFT JOIN stock_info si ON ds.symbol = si.symbol
                    {' WHERE (ds.symbol LIKE :search OR si.name LIKE :search)' if search else ''}
                    ORDER BY ds.symbol ASC
                    LIMIT 1 OFFSET {offset}
                ) as first_symbol
                """
                
                try:
                    first_symbol_result = db.execute(text(symbol_query), params).fetchone()
                    if first_symbol_result:
                        first_symbol = first_symbol_result[0]
                        # 使用symbol作为过滤条件，避免使用大的OFFSET
                        modified_query = f"""
                        {base_query}
                        {' WHERE ' if not search else ' AND '} s.symbol >= :first_symbol
                        ORDER BY s.symbol ASC LIMIT {page_size}
                        """
                        params['first_symbol'] = first_symbol
                        query = text(modified_query)
                    else:
                        # 如果找不到第一个symbol，回退到标准查询
                        query = text(base_query + f" ORDER BY s.symbol ASC LIMIT {page_size} OFFSET {offset}")
                except Exception as e:
                    print(f"获取首个symbol错误: {e}")
                    # 出错时回退到标准查询
                    query = text(base_query + f" ORDER BY s.symbol ASC LIMIT {page_size} OFFSET {offset}")
            else:
                # 对于小页码，使用标准OFFSET方式
                query = text(base_query + f" ORDER BY s.symbol ASC LIMIT {page_size} OFFSET {offset}")
                
            # 执行查询
            stocks = pd.read_sql(query, db.bind, params=params)
        except Exception as e:
            print(f"分页查询错误: {e}")
            # 出错时返回空结果
            return {
                "items": [],
                "total": total,
                "page_size": page_size,
                "current_page": page,
                "next_page": None,
                "prev_page": None,
                "next_cursor": None,
                "prev_cursor": None,
                "error": str(e)
            }
        
        # 计算下一页和上一页的页码
        has_next = offset + page_size < total
        has_prev = page > 1
        
        # 转换字段名以匹配前端期望的格式
        result_items = []
        for _, row in stocks.iterrows():
            item = {
                "symbol": row["symbol"],
                "name": row["name"] if pd.notna(row["name"]) else "N/A",
                "current_price": float(row["latest_price"]) if pd.notna(row["latest_price"]) else None,
                "change_percent": float(row["change_percent"]) if pd.notna(row["change_percent"]) else 0,
                "volume": float(row["volume"]) if pd.notna(row["volume"]) else 0
            }
            result_items.append(item)
            
        return {
            "items": result_items,
            "total": total,
            "page_size": page_size,
            "current_page": page,
            "next_page": page + 1 if has_next else None,
            "prev_page": page - 1 if has_prev else None,
            "next_cursor": None,  # 保持兼容性
            "prev_cursor": None   # 保持兼容性
        }
    
    # 基于游标的分页（保留原有功能）- 优化查询
    else:
        # 添加游标条件
        if cursor:
            try:
                # 解码游标（格式：symbol值）
                cursor_symbol = cursor
                where_clauses.append("s.symbol > :cursor_symbol")
                params['cursor_symbol'] = cursor_symbol
                
                # 不需要重新组合WHERE子句，使用已优化的base_query
            except Exception as e:
                print(f"游标解析错误: {e}")
                # 如果游标解析失败，忽略游标条件
                pass

        try:
            # 添加排序和限制
            if cursor and 'cursor_symbol' in params:
                if where_clauses:
                    query = text(base_query + " AND s.symbol > :cursor_symbol" + 
                                f" ORDER BY s.symbol ASC LIMIT {page_size + 1}")
                else:
                    query = text(base_query + " WHERE s.symbol > :cursor_symbol" + 
                                f" ORDER BY s.symbol ASC LIMIT {page_size + 1}")
            else:
                query = text(base_query + f" ORDER BY s.symbol ASC LIMIT {page_size + 1}")

            # 执行查询
            stocks = pd.read_sql(query, db.bind, params=params)
        except Exception as e:
            print(f"游标分页查询错误: {e}")
            # 出错时返回空结果
            return {
                "items": [],
                "total": total,
                "page_size": page_size,
                "next_cursor": None,
                "prev_cursor": None,
                "error": str(e)
            }

        # 处理游标分页
        next_cursor = None
        if len(stocks) > page_size:
            next_cursor = stocks.iloc[page_size-1]['symbol']
            stocks = stocks.iloc[:page_size]

        # 计算上一页游标（如果有）
        prev_cursor = None
        if cursor:
            # 获取当前页第一条记录之前的记录
            if not stocks.empty:
                first_symbol = stocks.iloc[0]['symbol']
                prev_query = f"""
                SELECT ds.symbol
                FROM (SELECT DISTINCT ds.symbol 
                      FROM daily_stock ds
                      LEFT JOIN stock_info si ON ds.symbol = si.symbol
                      WHERE ds.symbol < :first_symbol
                      {' AND (ds.symbol LIKE :search OR si.name LIKE :search)' if search else ''}
                      ORDER BY ds.symbol DESC
                      LIMIT {page_size}) sub
                ORDER BY symbol ASC
                LIMIT 1
                """
                prev_params = {'first_symbol': first_symbol}
                if search:
                    prev_params['search'] = f"%{search}%"
                prev_result = db.execute(text(prev_query), prev_params).fetchone()
                if prev_result:
                    prev_cursor = prev_result[0]

        # 转换字段名以匹配前端期望的格式
        result_items = []
        for _, row in stocks.iterrows():
            item = {
                "symbol": row["symbol"],
                "name": row["name"] if "name" in row and pd.notna(row["name"]) else "N/A",
                "current_price": float(row["latest_price"]) if pd.notna(row["latest_price"]) else None,
                "change_percent": float(row["change_percent"]) if "change_percent" in row and pd.notna(row["change_percent"]) else 0,
                "volume": float(row["volume"]) if "volume" in row and pd.notna(row["volume"]) else 0
            }
            result_items.append(item)

        return {
            "items": result_items,
            "total": total,
            "page_size": page_size,
            "next_cursor": next_cursor,
            "prev_cursor": prev_cursor
        }


def get_index_list(db: Session, page_size: int = 20, cursor: str | None = None, search: str | None = None, page: int | None = None):
    # 基础查询 - 扩展返回字段，包括名称、涨跌幅和成交量
    base_query = """
    SELECT DISTINCT di.symbol,
           COALESCE(ii.name, 'N/A') as name,  -- 从index_info表获取名称
           first_value(di.close) OVER (PARTITION BY di.symbol ORDER BY di.date DESC) as latest_price,
           first_value(di.change_rate) OVER (PARTITION BY di.symbol ORDER BY di.date DESC) as change_percent,
           first_value(di.volume) OVER (PARTITION BY di.symbol ORDER BY di.date DESC) as volume
    FROM daily_index di
    LEFT JOIN index_info ii ON di.symbol = ii.symbol
    """
    count_base_query = "SELECT COUNT(DISTINCT symbol) FROM daily_index"

    params = {}
    where_clauses = []

    # 添加搜索条件
    if search:
        where_clauses.append("symbol LIKE :search")
        params['search'] = f"%{search}%"

    # 组合WHERE子句
    if where_clauses:
        base_query += " WHERE " + " AND ".join(where_clauses)
        count_base_query += " WHERE " + " AND ".join(where_clauses)

    # 执行计数查询 - 使用缓存变量避免重复计算
    count_query = text(count_base_query)
    try:
        total = db.execute(count_query, params).scalar()
    except Exception as e:
        print(f"计数查询错误: {e}")
        total = 0  # 出错时提供默认值

    # 基于页码的分页
    if page is not None:
        # 计算偏移量
        offset = (page - 1) * page_size
        # 添加排序和限制
        query = text(base_query + f" ORDER BY symbol ASC LIMIT {page_size} OFFSET {offset}")
        # 执行查询
        indices = pd.read_sql(query, db.bind, params=params)
        
        # 计算下一页和上一页的页码
        has_next = offset + page_size < total
        has_prev = page > 1
        
        return {
            "items": indices.to_dict(orient="records"),
            "total": total,
            "page_size": page_size,
            "current_page": page,
            "next_page": page + 1 if has_next else None,
            "prev_page": page - 1 if has_prev else None,
            "next_cursor": None,  # 保持兼容性
            "prev_cursor": None   # 保持兼容性
        }
    
    # 基于游标的分页（保留原有功能）
    else:
        # 添加游标条件
        if cursor:
            try:
                # 解码游标（格式：symbol值）
                cursor_symbol = cursor
                where_clauses.append("symbol > :cursor_symbol")
                params['cursor_symbol'] = cursor_symbol
                
                # 不需要重新组合WHERE子句，使用已优化的base_query
                # 游标条件已经添加到where_clauses中
            except Exception:
                # 如果游标解析失败，忽略游标条件
                pass

        # 添加排序和限制
        query = text(base_query + f" ORDER BY symbol ASC LIMIT {page_size + 1}")

        # 执行查询
        indices = pd.read_sql(query, db.bind, params=params)

        # 处理游标分页
        next_cursor = None
        if len(indices) > page_size:
            next_cursor = indices.iloc[page_size-1]['symbol']
            indices = indices.iloc[:page_size]

        # 计算上一页游标（如果有）
        prev_cursor = None
        if cursor:
            # 获取当前页第一条记录之前的记录
            if not indices.empty:
                first_symbol = indices.iloc[0]['symbol']
                prev_query = f"""
                SELECT symbol
                FROM (SELECT DISTINCT symbol FROM daily_index
                      WHERE symbol < :first_symbol
                      {' AND symbol LIKE :search' if search else ''}
                      ORDER BY symbol DESC
                      LIMIT {page_size}) sub
                ORDER BY symbol ASC
                LIMIT 1
                """
                prev_params = {'first_symbol': first_symbol}
                if search:
                    prev_params['search'] = f"%{search}%"
                prev_result = db.execute(text(prev_query), prev_params).fetchone()
                if prev_result:
                    prev_cursor = prev_result[0]

        return {
            "items": indices.to_dict(orient="records"),
            "total": total,
            "page_size": page_size,
            "next_cursor": next_cursor,
            "prev_cursor": prev_cursor
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