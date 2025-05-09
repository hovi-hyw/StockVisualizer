# backend/models/etf_model.py
"""
此模块定义了ETF数据的模型类。
包括ETF日线数据的模型定义和数据转换方法。
Authors: hovi.hyw & AI
Date: 2025-03-25
"""

from sqlalchemy import Column, String, Float, Date, BigInteger, PrimaryKeyConstraint
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from backend.database.connection import Base


class ETFDailyData(Base):
    """
    ETF日线数据数据库模型。
    对应数据库中的daily_etf表。

    Attributes:
        symbol (str): ETF代码
        date (date): 日期
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
    __tablename__ = "daily_etf"

    symbol = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(BigInteger)
    amount = Column(Float)
    amplitude = Column(Float)
    change_rate = Column(Float)
    change_amount = Column(Float)
    turnover_rate = Column(Float)

    __table_args__ = (
        PrimaryKeyConstraint('symbol', 'date'),
    )

    def __repr__(self):
        return f"<ETFDailyData(symbol={self.symbol}, date={self.date})>"


class ETFInfo(Base):
    """
    ETF基本信息数据库模型。
    对应数据库中的etf_info表。

    Attributes:
        symbol (str): ETF代码
        name (str): ETF名称
    """
    __tablename__ = "etf_info"

    symbol = Column(String, primary_key=True, nullable=False)
    name = Column(String(100), nullable=False)

    def __repr__(self):
        return f"<ETFInfo(symbol={self.symbol}, name={self.name})>"


# Pydantic模型，用于API响应
class ETFData(BaseModel):
    """
    ETF数据API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): ETF代码
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


class ETFInfo(BaseModel):
    """
    ETF基本信息API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): ETF代码
        name (str): ETF名称
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
    name: str
    latest_date: Optional[date] = None
    open: Optional[float] = None
    close: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    volume: Optional[int] = None
    amount: Optional[float] = None
    amplitude: Optional[float] = None
    change_rate: Optional[float] = None
    change_amount: Optional[float] = None
    turnover_rate: Optional[float] = None

    class Config:
        """Pydantic配置类"""
        orm_mode = True


class ETFList(BaseModel):
    """
    ETF列表API模型。
    用于API响应的Pydantic模型。

    Attributes:
        items (List[ETFInfo]): ETF列表
        total (int): 总数
        page (int): 当前页码
        page_size (int): 每页数量
        next_cursor (Optional[str]): 下一页游标
        prev_cursor (Optional[str]): 上一页游标
    """
    items: List[ETFInfo]
    total: int
    page: int
    page_size: int
    next_cursor: Optional[str] = None
    prev_cursor: Optional[str] = None


class ETFKlineData(BaseModel):
    """
    ETF K线数据API模型。
    用于API响应的Pydantic模型。

    Attributes:
        symbol (str): ETF代码
        name (str): ETF名称
        data (List[ETFData]): K线数据列表
    """
    symbol: str
    name: str
    data: List[ETFData]