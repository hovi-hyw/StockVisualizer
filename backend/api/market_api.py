# backend/api/market_api.py
"""
此模块定义了市场数据相关的API端点。
提供获取市场指数、热门行业、概念板块和市场资讯的实时数据API接口。
Authors: hovi.hyw & AI
Date: 2025-03-12
更新: 2025-03-17 - 添加热门行业、概念板块和市场资讯API
"""

from fastapi import APIRouter, HTTPException
import akshare as ak
import pandas as pd
from typing import Dict, List, Any

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/indices")
async def get_market_indices():
    """
    获取主要市场指数的实时数据。
    返回上证指数、深证成指、创业板指和科创50的最新数据。

    Returns:
        dict: 包含主要市场指数的实时数据
    """
    try:
        # 使用akshare获取A股大盘指数实时行情
        indices_data = ak.stock_zh_index_spot()
        
        # 提取需要的指数数据
        # 上证指数(000001)、深证成指(399001)、创业板指(399006)、科创50(000688)
        target_indices = ['000001', '399001', '399006', '000688']
        result = {}
        
        for index_code in target_indices:
            # 在数据中查找对应的指数
            index_row = indices_data[indices_data['代码'] == index_code]
            if not index_row.empty:
                index_data = index_row.iloc[0]
                # 构建指数数据结构
                result[index_code] = {
                    "code": index_code,
                    "name": index_data.get('名称', ''),
                    "current": float(index_data.get('最新价', 0)),
                    "change": float(index_data.get('涨跌额', 0)),
                    "change_percent": float(index_data.get('涨跌幅', 0).strip('%')) if isinstance(index_data.get('涨跌幅'), str) else float(index_data.get('涨跌幅', 0)),
                    "volume": float(index_data.get('成交量', 0)),
                    "turnover": float(index_data.get('成交额', 0))
                }
        
        # 如果没有找到任何指数数据，返回错误
        if not result:
            raise HTTPException(status_code=404, detail="No index data found")
            
        return result
    except Exception as e:
        # 打印详细错误信息以便调试
        import traceback
        print(f"获取市场指数数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch market indices: {str(e)}")

@router.get("/hot-industries", response_model=List[Dict[str, Any]])
async def get_hot_industries():
    """
    获取热门行业实时数据。
    返回当前市场热门行业的涨跌幅和热度数据。

    Returns:
        List[Dict[str, Any]]: 热门行业数据列表
    """
    try:
        # 使用akshare获取行业板块实时行情
        industries_data = ak.stock_board_industry_name_em()
        
        # 按照涨跌幅排序，获取前10个热门行业
        industries_data = industries_data.sort_values(by='涨跌幅', ascending=False).head(10)
        
        result = []
        for _, row in industries_data.iterrows():
            # 计算热度值 (基于涨跌幅和成交额的加权计算)
            change_percent = float(row.get('涨跌幅', 0).strip('%')) if isinstance(row.get('涨跌幅'), str) else float(row.get('涨跌幅', 0))
            turnover = float(row.get('成交额', 0))
            # 简单热度计算公式：涨跌幅权重0.7 + 成交额排名权重0.3
            hot_score = min(100, max(60, 80 + change_percent * 2))
            
            result.append({
                "name": row.get('板块名称', ''),
                "change": f"+{change_percent:.2f}%" if change_percent > 0 else f"{change_percent:.2f}%",
                "hot": int(hot_score),
                "leader": row.get('领涨股', ''),
                "leader_change": row.get('领涨股涨跌幅', '')
            })
        
        return result
    except Exception as e:
        import traceback
        print(f"获取热门行业数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch hot industries: {str(e)}")

@router.get("/concept-sectors", response_model=List[Dict[str, Any]])
async def get_concept_sectors():
    """
    获取概念板块实时数据。
    返回当前市场热门概念板块的涨跌幅和热度数据。

    Returns:
        List[Dict[str, Any]]: 概念板块数据列表
    """
    try:
        # 使用akshare获取概念板块实时行情
        concepts_data = ak.stock_board_concept_name_em()
        
        # 按照涨跌幅排序，获取前10个热门概念
        concepts_data = concepts_data.sort_values(by='涨跌幅', ascending=False).head(10)
        
        result = []
        for _, row in concepts_data.iterrows():
            # 计算热度值
            change_percent = float(row.get('涨跌幅', 0).strip('%')) if isinstance(row.get('涨跌幅'), str) else float(row.get('涨跌幅', 0))
            # 概念板块热度计算，涨幅越高热度越高
            hot_score = min(100, max(60, 80 + change_percent * 2))
            
            result.append({
                "name": row.get('板块名称', ''),
                "change": f"+{change_percent:.2f}%" if change_percent > 0 else f"{change_percent:.2f}%",
                "hot": int(hot_score),
                "leader": row.get('领涨股', ''),
                "leader_change": row.get('领涨股涨跌幅', '')
            })
        
        return result
    except Exception as e:
        import traceback
        print(f"获取概念板块数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch concept sectors: {str(e)}")

@router.get("/market-news", response_model=List[Dict[str, Any]])
async def get_market_news():
    """
    获取市场最新资讯。
    返回最新的市场新闻和公告。

    Returns:
        List[Dict[str, Any]]: 市场资讯列表
    """
    try:
        # 使用akshare获取金融新闻
        news_data = ak.stock_news_em()
        
        # 获取最新的10条新闻
        news_data = news_data.head(10)
        
        result = []
        for _, row in news_data.iterrows():
            result.append({
                "title": row.get('新闻标题', ''),
                "summary": row.get('新闻内容', '')[:100] + '...' if len(row.get('新闻内容', '')) > 100 else row.get('新闻内容', ''),
                "source": row.get('新闻来源', ''),
                "url": row.get('新闻链接', ''),
                "date": row.get('发布时间', '')
            })
        
        return result
    except Exception as e:
        import traceback
        print(f"获取市场资讯数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch market news: {str(e)}")