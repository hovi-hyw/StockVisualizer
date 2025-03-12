# backend/utils/date_utils.py
"""
此模块提供日期处理相关的工具函数。
包括日期格式转换、日期范围计算等功能。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

from datetime import datetime, date, timedelta


def parse_date(date_str):
    """
    解析日期字符串为日期对象。

    Args:
        date_str (str): 日期字符串，格式为'YYYY-MM-DD'

    Returns:
        date: 日期对象

    Raises:
        ValueError: 如果日期格式不正确

    Examples:
        >>> parse_date('2023-01-01')
        datetime.date(2023, 1, 1)
    """
    if not date_str:
        return None

    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        raise ValueError(f"Invalid date format: {date_str}. Expected format: YYYY-MM-DD")


def get_date_range(period):
    """
    根据指定的时间段获取日期范围。

    Args:
        period (str): 时间段，支持'1d'(一天)、'1w'(一周)、'1m'(一个月)、'3m'(三个月)、
                     '6m'(六个月)、'1y'(一年)、'3y'(三年)、'5y'(五年)、'all'(全部)

    Returns:
        tuple: (开始日期, 结束日期)

    Examples:
        >>> get_date_range('1m')
        (datetime.date(2023, 2, 12), datetime.date(2023, 3, 12))
    """
    today = date.today()

    if period == '1d':
        return today, today
    elif period == '1w':
        return today - timedelta(days=7), today
    elif period == '1m':
        return today.replace(month=today.month - 1) if today.month > 1 else today.replace(year=today.year - 1,
                                                                                          month=12), today
    elif period == '3m':
        return today.replace(month=today.month - 3) if today.month > 3 else today.replace(year=today.year - 1,
                                                                                          month=today.month + 9), today
    elif period == '6m':
        return today.replace(month=today.month - 6) if today.month > 6 else today.replace(year=today.year - 1,
                                                                                          month=today.month + 6), today
    elif period == '1y':
        return today.replace(year=today.year - 1), today
    elif period == '3y':
        return today.replace(year=today.year - 3), today
    elif period == '5y':
        return today.replace(year=today.year - 5), today
    elif period == 'all':
        return date(1990, 1, 1), today
    else:
        raise ValueError(f"Invalid period: {period}")


def format_date_for_display(date_obj):
    """
    将日期对象格式化为显示用的字符串。

    Args:
        date_obj (date): 日期对象

    Returns:
        str: 格式化后的日期字符串 (YYYY年MM月DD日)

    Examples:
        >>> format_date_for_display(date(2023, 1, 1))
        '2023年01月01日'
    """
    if not date_obj:
        return ""

    return date_obj.strftime('%Y年%m月%d日')