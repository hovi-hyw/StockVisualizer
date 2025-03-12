# backend/services/stock_service.py
"""
此模块提供股票数据相关的服务功能。
包括获取股票列表、股票详情和K线数据的服务方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session

from ..database.queries import get_stock_list, get_stock_kline_data, get_stock_info


class StockService:
    """
    股票数据服务类。
    提供获取股票列表、股票详情和K线数据的服务方法。

    Methods:
        get_stock_list: 获取股票列表
        get_stock_info: 获取股票详情
        get_stock_kline: 获取股票K线数据

    Examples:
        >>> from sqlalchemy.orm import Session
        >>> service = StockService()
        >>> stocks = service.get_stock_list(db, page=1, page_size=10)
    """

    def get_stock_list(self, db: Session, page: int = 1, page_size: int = 20, search: str = None):
        """
        获取股票列表。

        Args:
            db (Session): 数据库会话
            page (int): 页码，默认为1
            page_size (int): 每页数量，默认为20
            search (str, optional): 搜索关键字

        Returns:
            dict: 包含股票列表和分页信息的字典
        """
        return get_stock_list(db, page, page_size, search)

    def get_stock_info(self, db: Session, symbol: str):
        """
        获取股票详情。

        Args:
            db (Session): 数据库会话
            symbol (str): 股票代码

        Returns:
            dict: 股票详情信息

        Raises:
            ValueError: 如果股票不存在
        """
        stock_info = get_stock_info(db, symbol)
        if not stock_info:
            raise ValueError(f"Stock with symbol {symbol} not found")
        return stock_info

    def get_stock_kline(self, db: Session, symbol: str, start_date: date = None, end_date: date = None):
        """
        获取股票K线数据。

        Args:
            db (Session): 数据库会话
            symbol (str): 股票代码
            start_date (date, optional): 开始日期，默认为一年前
            end_date (date, optional): 结束日期，默认为今天

        Returns:
            dict: 包含股票代码和K线数据的字典

        Raises:
            ValueError: 如果未找到数据
        """
        # 设置默认日期范围
        if end_date is None:
            end_date = date.today()
        if start_date is None:
            start_date = end_date - timedelta(days=365)

        kline_data = get_stock_kline_data(db, symbol, start_date, end_date)
        if not kline_data:
            raise ValueError(f"No data found for stock {symbol} in the specified date range")

        return {
            "symbol": symbol,
            "data": kline_data
        }