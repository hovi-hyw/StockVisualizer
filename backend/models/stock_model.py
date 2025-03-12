# backend/models/stock_model.py
"""
此模块定义了股票数据的模型类。
包括股票日线数据的模型定义和数据转换方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from sqlalchemy import Column, String, Float, Date, PrimaryKeyConstraint
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from ..database.connection import Base


class StockDailyData(Base):
    """
    股票日线数据数据库模型。
    对应数据库中的stock_daily_data表。

    Attributes:
        symbol (str): 股票代码
        date (date): 日期
        open (float): 开盘价
        close (float): 收盘价
        high (float): 最高价
        low (float): 最低价
        volume (float): 成交量
        amount (float): 成交额
        outstanding_share (float): 流通股本
        turnover (float): 换手率
    """
    __tablename__ = "stock_daily_data"

    symbol = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(Float)
    amount = Column(Float)
    outstanding_share = Column(Float)
    turnover = Column(Float)

    __table_args__ = (
        PrimaryKeyConstraint('symbol', 'date'),
    )

    def __repr__(self):
        return f"<StockDailyData(symbol={self.symbol}, date={self.date})>"


# Pydantic模型，用于API响应
class StockData(BaseModel):
    """
    股票数据API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): 股票代码
        date (date): 日期
        open (float): 开盘价
        close (float): 收盘价
        high (float): 最高价
        low (float): 最低价
        volume (float): 成交量
        amount (Optional[float]): 成交额
        outstanding_share (Optional[float]): 流通股本
        turnover (Optional[float]): 换手率
    """
    symbol: str
    date: date
    open: float
    close: float
    high: float
    low: float
    volume: float
    amount: Optional[float] = None
    outstanding_share: Optional[float] = None
    turnover: Optional[float] = None

    class Config:
        """Pydantic配置类"""
        orm_mode = True


class StockInfo(BaseModel):
    """
    股票基本信息API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): 股票代码
        latest_date (date): 最新数据日期
        open (float): 开盘价
        close (float): 收盘价
        high (float): 最高价
        low (float): 最低价
        volume (float): 成交量
        amount (Optional[float]): 成交额
        outstanding_share (Optional[float]): 流通股本
        turnover (Optional[float]): 换手率
    """
    symbol: str
    latest_date: date
    open: float
    close: float
    high: float
    low: float
    volume: float
    amount: Optional[float] = None
    outstanding_share: Optional[float] = None
    turnover: Optional[float] = None


class StockList(BaseModel):
    """
    股票列表API模型。
    用于API响应的Pydantic模型。

    Attributes:
        items (List[dict]): 股票列表项
        total (int): 总数
        page (int): 当前页码
        page_size (int): 每页数量
    """
    items: List[dict]
    total: int
    page: int
    page_size: int


class StockKlineData(BaseModel):
    """
    股票K线数据API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): 股票代码
        data (List[dict]): K线数据列表
    """
    symbol: str
    data: List[dict]