# backend/services/data_processor.py
"""
此模块提供数据处理和转换功能。
包括数据格式转换和数据处理的工具方法。
Authors: hovi.hyw & AI
Date: 2025-03-12
"""

import pandas as pd
from datetime import datetime


class DataProcessor:
    """
    数据处理类。
    提供数据格式转换和处理的方法。

    Methods:
        format_kline_data: 格式化K线数据为ECharts格式
        format_date: 格式化日期字符串

    Examples:
        >>> processor = DataProcessor()
        >>> formatted_data = processor.format_kline_data(data)
    """

    @staticmethod
    def format_kline_data(data_list):
        """
        将K线数据格式化为ECharts所需的格式。

        Args:
            data_list (list): 原始K线数据列表

        Returns:
            dict: 格式化后的数据，包含日期、K线数据和成交量
        """
        dates = []
        k_data = []
        volumes = []

        for item in data_list:
            # 格式化日期
            date_str = DataProcessor.format_date(item.get('date'))
            dates.append(date_str)

            # K线数据: [open, close, low, high]
            k_data.append([
                item.get('open'),
                item.get('close'),
                item.get('low'),
                item.get('high')
            ])

            # 成交量
            volumes.append(item.get('volume', 0))

        return {
            'dates': dates,
            'kData': k_data,
            'volumes': volumes
        }

    @staticmethod
    def format_date(date_str):
        """
        格式化日期字符串。

        Args:
            date_str (str): 原始日期字符串

        Returns:
            str: 格式化后的日期字符串 (YYYY-MM-DD)
        """
        if isinstance(date_str, str):
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                return date_str
        return date_str

    @staticmethod
    def dataframe_to_dict_list(df):
        """
        将DataFrame转换为字典列表。

        Args:
            df (pandas.DataFrame): 待转换的DataFrame

        Returns:
            list: 字典列表
        """
        if df is None or df.empty:
            return []

        # 处理日期列
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].dt.strftime('%Y-%m-%d')

        # 转换为字典列表
        return df.to_dict(orient='records')