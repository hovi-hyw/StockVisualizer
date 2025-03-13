# backend/test_stock_info.py
"""
测试脚本，用于检查get_stock_info函数在处理特定股票代码时的行为。
"""

import logging
import traceback
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.queries import get_stock_info
from backend.config.settings import settings

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("stock-info-test")

def test_get_stock_info(symbol):
    """测试获取股票信息函数"""
    logger.info(f"Testing get_stock_info for symbol: {symbol}")
    
    # 创建数据库连接
    engine = create_engine(settings.DATABASE_URL)
    session = Session(engine)
    
    try:
        # 调用函数获取股票信息
        result = get_stock_info(session, symbol)
        logger.info(f"Result: {result}")
        
        # 检查结果中的字段
        if result:
            logger.info("Fields in result:")
            for key, value in result.items():
                logger.info(f"  {key}: {value} (type: {type(value)})")
        else:
            logger.warning(f"No data found for symbol {symbol}")
            
        return result
    except Exception as e:
        logger.error(f"Error getting stock info for {symbol}: {e}")
        logger.error(traceback.format_exc())
        return None
    finally:
        session.close()

if __name__ == "__main__":
    # 测试正常工作的股票代码
    test_get_stock_info("sh000001")
    
    # 测试出错的股票代码
    test_get_stock_info("bj430047")
    test_get_stock_info("bj430090")