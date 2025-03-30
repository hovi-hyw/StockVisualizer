# backend/config/settings.py
"""
此模块包含应用程序的配置设置。
定义了数据库连接、API设置和其他全局配置参数。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Settings(BaseSettings):
    """
    应用程序配置类。
    该类负责管理应用程序的所有配置参数，包括：
    1. 数据库连接信息
    2. API设置
    3. 日志配置

    Attributes:
        PROJECT_NAME: 项目名称
        API_V1_STR: API路径前缀
        DATABASE_URL: 数据库连接URL
        LOG_LEVEL: 日志级别

    Examples:
        >>> settings = Settings()
        >>> print(settings.DATABASE_URL)
        postgresql://postgres:password@localhost:5432/stockdb
    """
    PROJECT_NAME: str = "Stock Visualizer"
    API_V1_STR: str = "/api"

    # 数据库设置
    @staticmethod
    def get_database_url():
        """
        根据运行环境自动选择正确的数据库连接字符串
        优先使用环境变量中的配置，如果未设置则根据运行环境自动选择
        """
        # 从环境变量获取数据库URL
        db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_CONNECTION_STRING")
        if db_url:
            return db_url
            
        # 如果环境变量中没有设置，则根据环境自动选择
        # 检查是否在Docker环境中运行
        is_docker = os.path.exists('/.dockerenv') or os.environ.get('DOCKER_CONTAINER') == 'true'
        
        # 获取数据库连接信息（全部从环境变量中读取，提供合理的默认值）
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "postgres")
        db_name = os.getenv("DB_NAME", "stock_db")
        
        # 根据环境选择主机名，优先使用环境变量中的配置
        db_host = os.getenv("DB_HOST")
        if not db_host:
            # 如果环境变量中未设置主机名，则根据运行环境自动选择
            if is_docker:
                db_host = os.getenv("DB_HOST_DOCKER", "pgdb")
            else:
                db_host = os.getenv("DB_HOST_LOCAL", "localhost")
            
        return f"postgresql://{db_user}:{db_password}@{db_host}:5432/{db_name}"
    
    DATABASE_URL: str = get_database_url()

    # 日志设置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # 跨域设置
    BACKEND_CORS_ORIGINS: list = ["*"]

    # 分页设置
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    class Config:
        """Pydantic配置类"""
        case_sensitive = True


# 实例化配置对象
settings = Settings()