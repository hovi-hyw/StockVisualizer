# backend/database/connection.py
"""
此模块负责建立和管理与PostgreSQL数据库的连接。
提供了数据库会话和引擎的创建功能。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from ..config.settings import settings

# 创建数据库引擎
engine = create_engine(settings.DATABASE_URL)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()


def get_db():
    """
    获取数据库会话。
    创建一个新的数据库会话，并在使用完毕后关闭它。

    Yields:
        Session: SQLAlchemy会话对象

    Examples:
        >>> from fastapi import Depends
        >>> from .connection import get_db
        >>> def my_endpoint(db: Session = Depends(get_db)):
        >>>     # 使用数据库会话
        >>>     pass
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()