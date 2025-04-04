# backend/services/index_service.py
"""
此模块提供指数数据相关的服务功能。
包括获取指数列表、指数详情和K线数据的服务方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from datetime import date, timedelta
from sqlalchemy.orm import Session

from backend.database.queries import get_index_list, get_index_kline_data, get_index_info


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

    def get_index_list(self, db: Session, page_size: int = 20, cursor: str | None = None, search: str | None = None, page: int | None = None):
        """
        获取指数列表。

        Args:
            db (Session): 数据库会话
            page_size (int): 每页数量，默认为20
            cursor (str, optional): 分页游标，用于获取下一页数据
            search (str, optional): 搜索关键字
            page (int, optional): 页码，从1开始，与cursor互斥，优先使用page

        Returns:
            dict: 包含指数列表和分页信息的字典
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
        
        return get_index_list(db, page_size, cursor, search_str, page)

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

    def get_index_kline(self, db: Session, symbol: str, start_date: date | None = None, end_date: date | None = None):
        """
        获取指数K线数据。

        Args:
            db (Session): 数据库会话
            symbol (str): 指数代码
            start_date (date, optional): 开始日期，默认为None（获取所有数据）
            end_date (date, optional): 结束日期，默认为None（获取所有数据）

        Returns:
            dict: 包含指数代码、名称和K线数据的字典

        Raises:
            ValueError: 如果未找到数据
        """
        # 调用queries.py中的函数获取K线数据
        kline_data = get_index_kline_data(db, symbol, start_date, end_date)

        if not kline_data:
            raise ValueError(f"No data found for index {symbol} in the specified date range")

        # 获取指数名称
        index_info = get_index_info(db, symbol)
        name = index_info.get('name') if index_info else None

        return {
            "symbol": symbol,
            "name": name,
            "data": kline_data,
        }