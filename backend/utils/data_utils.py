# backend/utils/data_utils.py
"""
此模块提供数据处理相关的工具函数。
包括数据格式转换、数据验证等功能。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

import pandas as pd
import numpy as np


def validate_symbol(symbol):
    """
    验证股票或指数代码格式是否正确。

    Args:
        symbol (str): 股票或指数代码

    Returns:
        bool: 如果格式正确返回True，否则返回False

    Examples:
        >>> validate_symbol('000001')
        True
        >>> validate_symbol('invalid!')
        False
    """
    if not symbol:
        return False

    # 股票代码一般为6位数字
    if len(symbol) == 6 and symbol.isdigit():
        return True

    # 也可能是指数代码，如'000001.SH'
    parts = symbol.split('.')
    if len(parts) == 2 and parts[0].isdigit() and parts[1] in ['SH', 'SZ', 'BJ']:
        return True

    return False


def format_float(value, decimal_places=2):
    """
    格式化浮点数，保留指定小数位。

    Args:
        value: 要格式化的值
        decimal_places (int): 小数位数，默认为2

    Returns:
        float: 格式化后的浮点数

    Examples:
        >>> format_float(123.4567)
        123.46
    """
    try:
        return round(float(value), decimal_places)
    except (ValueError, TypeError):
        return None


def handle_nan(data):
    """
    处理数据中的NaN值，将其替换为None。

    Args:
        data: 要处理的数据，可以是单个值、列表或字典

    Returns:
        处理后的数据

    Examples:
        >>> handle_nan(np.nan)
        None
        >>> handle_nan([1, np.nan, 3])
        [1, None, 3]
        >>> handle_nan({'a': 1, 'b': np.nan})
        {'a': 1, 'b': None}
    """
    if isinstance(data, (list, tuple)):
        return [handle_nan(item) for item in data]

    elif isinstance(data, dict):
        return {key: handle_nan(value) for key, value in data.items()}

    elif isinstance(data, pd.DataFrame):
        return data.replace({np.nan: None}).to_dict(orient='records')

    elif pd.isna(data):
        return None

    return data