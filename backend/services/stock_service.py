# backend/services/stock_service.py
"""
此模块提供股票数据相关的服务功能。
包括获取股票列表、股票详情和K线数据的服务方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session

from backend.database.queries import get_stock_list, get_stock_kline_data, get_stock_info


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

    def get_stock_list(self, db: Session, page: int = 1, page_size: int = 20, search: str | None = None):
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
        # 安全处理search参数
        search_str = ""
        if search is not None:
            # 直接尝试转换为字符串，不管是什么类型
            try:
                search_str = str(search)
                # 如果是空字符串或只包含空格，则设为空字符串
                if not search_str.strip():
                    search_str = ""
            except Exception:
                # 如果转换失败，使用空字符串
                search_str = ""
        
        return get_stock_list(db, page, page_size, search_str)

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
        # 尝试直接查询
        stock_info = get_stock_info(db, symbol)
        
        # 如果没有找到数据，尝试转换股票代码格式
        if not stock_info:
            # 尝试不同的股票代码格式
            if symbol.startswith('sh') or symbol.startswith('sz') or symbol.startswith('bj'):
                # 尝试去掉前缀
                alt_symbol = symbol[2:]
                stock_info = get_stock_info(db, alt_symbol)
            else:
                # 尝试添加前缀
                for prefix in ['sh', 'sz', 'bj']:
                    alt_symbol = f"{prefix}{symbol}"
                    stock_info = get_stock_info(db, alt_symbol)
                    if stock_info:
                        break
        
        if not stock_info:
            raise ValueError(f"Stock with symbol {symbol} not found")
        return stock_info

    def get_stock_kline(self, db: Session, symbol: str, start_date: date | None = None, end_date: date | None = None):
        """
        获取股票K线数据。

        Args:
            db (Session): 数据库会话
            symbol (str): 股票代码
            start_date (date, optional): 开始日期，默认为None（获取所有数据）
            end_date (date, optional): 结束日期，默认为None（获取所有数据）

        Returns:
            dict: 包含股票代码和K线数据的字典

        Raises:
            ValueError: 如果未找到数据
        """
        kline_data = get_stock_kline_data(db, symbol, start_date, end_date)
        if not kline_data:
            raise ValueError(f"No data found for stock {symbol} in the specified date range")

        return {
            "symbol": symbol,
            "data": kline_data
        }