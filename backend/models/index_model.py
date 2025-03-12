# backend/models/index_model.py
"""
此模块定义了指数数据的模型类。
包括指数日线数据的模型定义和数据转换方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from sqlalchemy import Column, String, Float, Date, BigInteger, Numeric, PrimaryKeyConstraint
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from backend.database.connection import Base


class IndexDailyData(Base):
    """
    指数日线数据数据库模型。
    对应数据库中的index_daily_data表。

    Attributes:
        symbol (str): 指数代码
        date (date): 日期
        name (str): 指数名称
        open (float): 开盘价
        close (float): 收盘价
        high (float): 最高价
        low (float): 最低价
        volume (int): 成交量
        amount (float): 成交额
        amplitude (float): 振幅
        change_rate (float): 涨跌幅
        change_amount (float): 涨跌额
        turnover_rate (float): 换手率
    """
    __tablename__ = "index_daily_data"

    symbol = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    name = Column(String(50))
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(BigInteger)
    amount = Column(Numeric(13, 2))
    amplitude = Column(Float)
    change_rate = Column(Float)
    change_amount = Column(Float)
    turnover_rate = Column(Float)

    __table_args__ = (
        PrimaryKeyConstraint('symbol', 'date'),
    )

    def __repr__(self):
        return f"<IndexDailyData(symbol={self.symbol}, date={self.date})>"


# Pydantic模型，用于API响应
class IndexData(BaseModel):
    """
    指数数据API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): 指数代码
        name (Optional[str]): 指数名称
        date (date): 日期
        open (float): 开盘价
        close (float): 收盘价
        high (float): 最高价
        low (float): 最低价
        volume (int): 成交量
        amount (Optional[float]): 成交额
        amplitude (Optional[float]): 振幅
        change_rate (Optional[float]): 涨跌幅
        change_amount (Optional[float]): 涨跌额
        turnover_rate (Optional[float]): 换手率
    """
    symbol: str
    name: Optional[str] = None
    date: date
    open: float
    close: float
    high: float
    low: float
    volume: int
    amount: Optional[float] = None
    amplitude: Optional[float] = None
    change_rate: Optional[float] = None
    change_amount: Optional[float] = None
    turnover_rate: Optional[float] = None

    class Config:
        """Pydantic配置类"""
        orm_mode = True


class IndexInfo(BaseModel):
    """
    指数基本信息API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): 指数代码
        name (Optional[str]): 指数名称
        latest_date (date): 最新数据日期
        open (float): 开盘价
        close (float): 收盘价
        high (float): 最高价
        low (float): 最低价
        volume (int): 成交量
        amount (Optional[float]): 成交额
        amplitude (Optional[float]): 振幅
        change_rate (Optional[float]): 涨跌幅
        change_amount (Optional[float]): 涨跌额
        turnover_rate (Optional[float]): 换手率
    """
    symbol: str
    name: Optional[str] = None
    latest_date: date
    open: float
    close: float
    high: float
    low: float
    volume: int
    amount: Optional[float] = None
    amplitude: Optional[float] = None
    change_rate: Optional[float] = None
    change_amount: Optional[float] = None
    turnover_rate: Optional[float] = None


class IndexList(BaseModel):
    """
    指数列表API模型。
    用于API响应的Pydantic模型。

    Attributes:
        items (List[dict]): 指数列表项
        total (int): 总数
        page (int): 当前页码
        page_size (int): 每页数量
    """
    items: List[dict]
    total: int
    page: int
    page_size: int


class IndexKlineData(BaseModel):
    """
    指数K线数据API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): 指数代码
        name (Optional[str]): 指数名称
        data (List[dict]): K线数据列表
    """
    symbol: str
    name: Optional[str] = None
    data: List[dict]