# backend/services/etf_service.py
"""
此模块提供ETF数据相关的服务功能。
包括获取ETF列表、ETF详情和K线数据的服务方法。
Authors: hovi.hyw & AI
Date: 2025-03-25
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd

from backend.database.queries import get_etf_kline_data, get_etf_info


class ETFService:
    """
    ETF数据服务类。
    提供获取ETF列表、ETF详情和K线数据的服务方法。

    Methods:
        get_etf_list: 获取ETF列表
        get_etf_info: 获取ETF详情
        get_etf_kline: 获取ETF K线数据
    """    
    
    def get_etf_list(self, db: Session, page: int = 1, page_size: int = 20, search: str | None = None):
        """
        获取ETF列表。

        Args:
            db (Session): 数据库会话
            page (int, optional): 页码，默认为1
            page_size (int, optional): 每页数量，默认为20
            search (str, optional): 搜索关键词，默认为None

        Returns:
            dict: 包含ETF列表、总数和分页信息的字典

        Raises:
            Exception: 如果查询失败
        """
        # 构建基础查询 - 获取最新价格、涨跌幅和成交量，并关联ETF名称
        base_query = """
        SELECT 
            e.symbol, 
            ei.name,
            e.close as latest_price,
            CASE 
                WHEN prev.close IS NOT NULL THEN ((e.close - prev.close) / prev.close * 100)
                ELSE 0 
            END as change_percent,
            e.volume
        FROM (
            SELECT symbol, MAX(date) as max_date
            FROM daily_etf
            GROUP BY symbol
        ) latest
        JOIN daily_etf e ON e.symbol = latest.symbol AND e.date = latest.max_date
        LEFT JOIN etf_info ei ON e.symbol = ei.symbol
        LEFT JOIN (
            -- 获取前一交易日数据用于计算涨跌幅
            SELECT de.symbol, de.close, de.date
            FROM daily_etf de
            INNER JOIN (
                SELECT symbol, MAX(date) as prev_date
                FROM daily_etf
                WHERE date < (
                    SELECT MAX(date) FROM daily_etf
                )
                GROUP BY symbol
            ) pd ON de.symbol = pd.symbol AND de.date = pd.prev_date
        ) prev ON e.symbol = prev.symbol
        """
        count_base_query = "SELECT COUNT(DISTINCT symbol) FROM daily_etf"

        params = {}
        where_clauses = []

        # 添加搜索条件
        if search:
            where_clauses.append("(e.symbol LIKE :search OR ei.name LIKE :search)")
            params['search'] = f"%{search}%"
            # 更新计数查询的搜索条件
            count_base_query = """
            SELECT COUNT(DISTINCT de.symbol) 
            FROM daily_etf de
            LEFT JOIN etf_info ei ON de.symbol = ei.symbol
            WHERE (de.symbol LIKE :search OR ei.name LIKE :search)
            """

        # 组合WHERE子句
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
            
        # 执行计数查询
        count_query = text(count_base_query)
        try:
            total = db.execute(count_query, params).scalar()
        except Exception as e:
            print(f"计数查询错误: {e}")
            total = 0  # 出错时提供默认值

        # 计算偏移量
        offset = (page - 1) * page_size
        
        try:
            # 添加排序和限制
            query = text(base_query + f" ORDER BY e.symbol ASC LIMIT {page_size} OFFSET {offset}")
            
            # 执行查询
            etfs = pd.read_sql(query, db.bind, params=params)
        except Exception as e:
            print(f"分页查询错误: {e}")
            # 出错时返回空结果
            return {
                "items": [],
                "total": total,
                "page_size": page_size,
                "current_page": page,
                "next_page": None,
                "prev_page": None
            }
        
        # 计算下一页和上一页的页码
        has_next = offset + page_size < total
        has_prev = page > 1
        
        # 转换字段名以匹配前端期望的格式
        result_items = []
        for _, row in etfs.iterrows():
            item = {
                "symbol": row["symbol"],
                "name": row["name"] if pd.notna(row["name"]) else "N/A",
                "latest_price": float(row["latest_price"]) if pd.notna(row["latest_price"]) else None,
                "change_rate": float(row["change_percent"]) if pd.notna(row["change_percent"]) else 0,
                "volume": float(row["volume"]) if pd.notna(row["volume"]) else 0
            }
            result_items.append(item)
            
        return {
            "items": result_items,
            "total": total,
            "page_size": page_size,
            "current_page": page,
            "next_page": page + 1 if has_next else None,
            "prev_page": page - 1 if has_prev else None
        }

    def get_etf_info(self, db: Session, symbol: str):
        """
        获取ETF详情。

        Args:
            db (Session): 数据库会话
            symbol (str): ETF代码

        Returns:
            dict: ETF详情信息

        Raises:
            ValueError: 如果ETF不存在
        """
        etf_info = get_etf_info(db, symbol)
        if not etf_info:
            raise ValueError(f"ETF with symbol {symbol} not found")
        return etf_info

    def get_etf_kline(self, db: Session, symbol: str, start_date: date | None = None, end_date: date | None = None):
        """
        获取ETF K线数据。

        Args:
            db (Session): 数据库会话
            symbol (str): ETF代码
            start_date (date, optional): 开始日期，默认为None（获取所有数据）
            end_date (date, optional): 结束日期，默认为None（获取所有数据）

        Returns:
            dict: 包含ETF代码、名称和K线数据的字典

        Raises:
            ValueError: 如果未找到数据
        """
        # 调用queries.py中的函数获取K线数据
        kline_data = get_etf_kline_data(db, symbol, start_date, end_date)

        if not kline_data:
            raise ValueError(f"No data found for ETF {symbol} in the specified date range")

        # 获取ETF名称
        etf_info = get_etf_info(db, symbol)
        if not etf_info:
            raise ValueError(f"ETF with symbol {symbol} not found")

        # 构建返回结果
        return {
            "symbol": symbol,
            "name": etf_info.get("name", "N/A"), # 使用 .get() 避免 KeyError
            "data": kline_data
        }
        
    def get_high_volume_etf_list(self, db: Session, page: int = 1, page_size: int = 20, search: str | None = None):
        """
        获取高成交额高振幅ETF列表。
        筛选条件：平均成交额 > 5亿，平均振幅 > 0.5%

        Args:
            db (Session): 数据库会话
            page (int, optional): 页码，默认为1
            page_size (int, optional): 每页数量，默认为20
            search (str, optional): 搜索关键词，默认为None

        Returns:
            dict: 包含高成交额高振幅ETF列表、总数和分页信息的字典

        Raises:
            Exception: 如果查询失败
        """
        # 构建查询 - 获取高成交额高振幅ETF
        base_query = """
        WITH recent_data AS (
            SELECT 
                e.symbol,
                e.date,
                e.amount,
                e.amplitude
            FROM daily_etf e
            WHERE e.date >= (
                SELECT date
                FROM (
                    SELECT DISTINCT date
                    FROM daily_etf
                    ORDER BY date DESC
                    LIMIT 250
                ) d
                ORDER BY date
                LIMIT 1
            )
        ),
        etf_stats AS (
            SELECT 
                rd.symbol,
                AVG(rd.amount) as avg_amount,
                AVG(rd.amplitude) as avg_amplitude
            FROM recent_data rd
            GROUP BY rd.symbol
            HAVING 
                AVG(rd.amount) > 500000000
                AND AVG(rd.amplitude) > 0.5
        )
        SELECT 
            e.symbol, 
            ei.name,
            e.close as latest_price,
            CASE 
                WHEN prev.close IS NOT NULL THEN ((e.close - prev.close) / prev.close * 100)
                ELSE 0 
            END as change_percent,
            e.volume,
            s.avg_amount,
            s.avg_amplitude
        FROM etf_stats s
        JOIN (SELECT symbol, MAX(date) as max_date FROM daily_etf GROUP BY symbol) latest ON s.symbol = latest.symbol
        JOIN daily_etf e ON e.symbol = latest.symbol AND e.date = latest.max_date
        LEFT JOIN etf_info ei ON e.symbol = ei.symbol
        LEFT JOIN (
            -- 获取前一交易日数据用于计算涨跌幅
            SELECT de.symbol, de.close, de.date
            FROM daily_etf de
            INNER JOIN (
                SELECT symbol, MAX(date) as prev_date
                FROM daily_etf
                WHERE date < (SELECT MAX(date) FROM daily_etf)
                GROUP BY symbol
            ) pd ON de.symbol = pd.symbol AND de.date = pd.prev_date
        ) prev ON e.symbol = prev.symbol
        """
        
        count_query = """
        WITH etf_stats AS (
            WITH recent_data AS (
                SELECT 
                    e.symbol,
                    e.date,
                    e.amount,
                    e.amplitude
                FROM daily_etf e
                WHERE e.date >= (
                    SELECT date
                    FROM (
                        SELECT DISTINCT date
                        FROM daily_etf
                        ORDER BY date DESC
                        LIMIT 250
                    ) d
                    ORDER BY date
                    LIMIT 1
                )
            )
            SELECT 
                rd.symbol,
                AVG(rd.amount) as avg_amount,
                AVG(rd.amplitude) as avg_amplitude
            FROM recent_data rd
            GROUP BY rd.symbol
            HAVING 
                AVG(rd.amount) > 500000000
                AND AVG(rd.amplitude) > 0.5
        )
        SELECT COUNT(*) FROM etf_stats
        """
        
        params = {}
        where_clauses = []

        # 添加搜索条件
        if search:
            where_clauses.append("(e.symbol LIKE :search OR ei.name LIKE :search)")
            params['search'] = f"%{search}%"
            # 更新计数查询的搜索条件
            count_query = """
            WITH etf_stats AS (
                SELECT 
                    de.symbol,
                    AVG(de.amount) as avg_amount,
                    AVG(de.amplitude) as avg_amplitude
                FROM daily_etf de
                WHERE de.date >= (
                    SELECT date
                    FROM (
                        SELECT DISTINCT date
                        FROM daily_etf
                        ORDER BY date DESC
                        LIMIT 250
                    ) d
                    ORDER BY date
                    LIMIT 1
                )
                GROUP BY de.symbol
                HAVING AVG(de.amount) > 500000000 AND AVG(de.amplitude) > 0.5
            )
            SELECT COUNT(DISTINCT s.symbol) 
            FROM etf_stats s
            LEFT JOIN etf_info ei ON s.symbol = ei.symbol
            WHERE (s.symbol LIKE :search OR ei.name LIKE :search)
            """

        # 组合WHERE子句
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
            
        # 执行计数查询
        count_query_text = text(count_query)
        try:
            total = db.execute(count_query_text, params).scalar()
        except Exception as e:
            print(f"计数查询错误: {e}")
            total = 0  # 出错时提供默认值

        # 计算偏移量
        offset = (page - 1) * page_size
        
        try:
            # 添加排序和限制
            query = text(base_query + f" ORDER BY avg_amount DESC LIMIT {page_size} OFFSET {offset}")
            
            # 执行查询
            etfs = pd.read_sql(query, db.bind, params=params)
        except Exception as e:
            print(f"分页查询错误: {e}")
            # 出错时返回空结果
            return {
                "items": [],
                "total": total,
                "page_size": page_size,
                "current_page": page,
                "next_page": None,
                "prev_page": None
            }
        
        # 计算下一页和上一页的页码
        has_next = offset + page_size < total
        has_prev = page > 1
        
        # 转换字段名以匹配前端期望的格式
        result_items = []
        for _, row in etfs.iterrows():
            item = {
                "symbol": row["symbol"],
                "name": row["name"] if pd.notna(row["name"]) else "N/A",
                "latest_price": float(row["latest_price"]) if pd.notna(row["latest_price"]) else None,
                "change_rate": float(row["change_percent"]) if pd.notna(row["change_percent"]) else 0,
                "volume": float(row["volume"]) if pd.notna(row["volume"]) else 0,
                "avg_amount": float(row["avg_amount"]) if pd.notna(row["avg_amount"]) else 0,
                "avg_amplitude": float(row["avg_amplitude"]) if pd.notna(row["avg_amplitude"]) else 0
            }
            result_items.append(item)
            
        return {
            "items": result_items,
            "total": total,
            "page_size": page_size,
            "current_page": page,
            "next_page": page + 1 if has_next else None,
            "prev_page": page - 1 if has_prev else None
        }