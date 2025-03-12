# backend/services/index_service.py
"""
此模块提供指数数据相关的服务功能。
包括获取指数列表、指数详情和K线数据的服务方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session

from ..database.queries import get_index_list, get_index_kline_data, get_index_info


class IndexService:
    """
    指数数据服务类。
    提供获取指数列表、指数详情和K线数据的服务方法。

    Methods:
        get_index_list: 获取指数列表
        get_index_info: 获取指数详情
        get_index_kline: 获取指数K线数据

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> service = IndexService()
        >>> indices = service.get_index_list(db, page=1, page_size=10)
    """

    def get_index_list(self, db: Session, page: int = 1, page_size: int = 20, search: str = None):
        """
        获取指数列表。

        Args:
            db (Session): 数据库会话
            page (int): 页码，默认为1
            page_size (int): 每页数量，默认为20
            search (str, optional): 搜索关键字

        Returns:
            dict: 包含指数列表和分页信息的字典
        """
        return get_index_list(db, page, page_size, search)

    def get_index_info(self, db: Session, symbol: str):
        """
        获取指数详情。

        Args:
            db (Session): 数据库会话
            symbol (str): 指数代码

        Returns:
            dict: 指数详情信息

        Raises:
            ValueError: 如果指数不存在
        """
        index_info = get_index_info(db, symbol)
        if not index_info:
            raise ValueError(f"Index with symbol {symbol} not found")
        return index_info

    def get_index_kline(self, db: Session, symbol: str, start_date: date = None, end_date: date = None):
        """
        获取指数K线数据。

        Args:
            db (Session): 数据库会话
            symbol (str): 指数代码
            start_date (date, optional): 开始日期，默认为一年前
            end_date (date, optional): 结束日期，默认为今天

        Returns:
            dict: 包含指数代码、名称和K线数据的字典

        Raises:
            ValueError: 如果未找到数据
        """
        # 设置默认日期范围
        if end_date is None:
            end_date = date.today()
        if start_date is None:
            start_date = end_date - timedelta(days=365)

        kline_data = get_index_kline_data(db, symbol, start_date, end_date)
        if not kline_data:
            raise ValueError(f"No data found for index {symbol} in the specified date range")

        # 获取指数名称
        index_info = get_index_info(db, symbol)
        name = index_info.get('name') if index_info else None

        return {
            "symbol": symbol,
            "name": name,
            "data": kline_data
        }