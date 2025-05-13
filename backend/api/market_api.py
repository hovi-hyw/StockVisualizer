# backend/api/market_api.py
"""
此模块定义了市场数据相关的API端点。
提供获取市场指数、热门行业、概念板块、市场资讯、市盈率和K线数据的实时数据API接口。
Authors: hovi.hyw & AI
Date: 2025-03-12
更新: 2025-03-17 - 添加热门行业、概念板块和市场资讯API
更新: 2025-03-28 - 添加市盈率和K线数据API
"""

from fastapi import APIRouter, HTTPException, Query
import akshare as ak
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

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
        # 使用akshare获取A股大盘指数实时行情 - 使用新浪财经数据源
        indices_data = ak.stock_zh_index_spot_sina()
        
        # 提取需要的指数数据
        # 上证指数(000001)、深证成指(399001)、创业板指(399006)、科创50(000688)
        # 沪深300(000300)、中小板指数(399005)、恒生互联网科技业指数(HSTECH)、中概互联网指数(KWEB)
        target_indices = ['sh000001', 'sz399001', 'sz399006', 'sh000688', 'sh000300', 'sz399005', 'HSTECH', 'KWEB']
        code_map = {
            'sh000001': '000001',  # 上证指数
            'sz399001': '399001',  # 深证成指
            'sz399006': '399006',  # 创业板指
            'sh000688': '000688',  # 科创50
            'sh000300': '000300',  # 沪深300
            'sz399005': '399005',  # 中小板指数
            'HSTECH': 'HSTECH',    # 恒生互联网科技业指数
            'KWEB': 'KWEB'         # 中概互联网指数
        }
        result = {}
        
        for index_code in target_indices:
            # 在数据中查找对应的指数
            index_row = indices_data[indices_data['代码'] == index_code]
            if not index_row.empty:
                index_data = index_row.iloc[0]
                # 构建指数数据结构
                standard_code = code_map[index_code]
                result[standard_code] = {
                    "code": standard_code,
                    "name": index_data.get('名称', ''),
                    "current": float(index_data.get('最新价', 0)),
                    "change": float(index_data.get('涨跌额', 0)),
                    "change_percent": float(index_data.get('涨跌幅', 0)),
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
                "code": row.get('代码', ''),  # 添加板块代码字段，用于获取相关个股
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
                "code": row.get('代码', ''),  # 添加板块代码字段，用于获取相关个股
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

@router.get("/industry-stocks/{industry_name}", response_model=List[Dict[str, Any]])
async def get_industry_stocks(industry_name: str):
    """
    获取行业板块相关个股数据。
    返回指定行业板块的相关个股数据列表。

    Args:
        industry_name: 行业板块名称

    Returns:
        List[Dict[str, Any]]: 行业相关个股数据列表
    """
    try:
        # 使用akshare获取行业成分股数据
        stocks_data = ak.stock_board_industry_cons_em(symbol=industry_name)
        
        # 按照涨跌幅排序
        stocks_data = stocks_data.sort_values(by='涨跌幅', ascending=False)
        
        result = []
        for _, row in stocks_data.iterrows():
            change_percent = float(row.get('涨跌幅', 0).strip('%')) if isinstance(row.get('涨跌幅'), str) else float(row.get('涨跌幅', 0))
            
            result.append({
                "name": row.get('名称', ''),
                "code": row.get('代码', ''),
                "change": f"+{change_percent:.2f}%" if change_percent > 0 else f"{change_percent:.2f}%",
                "price": float(row.get('最新价', 0)),
                "volume": f"{float(row.get('成交量', 0))/10000:.1f}万",
                "turnover": f"{float(row.get('成交额', 0))/10000:.1f}万"
            })
        
        return result
    except Exception as e:
        import traceback
        print(f"获取行业{industry_name}成分股数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch industry stocks: {str(e)}")

@router.get("/pe-ratio", response_model=List[Dict[str, Any]])
async def get_market_pe_ratio(market: str = Query(..., description="市场名称，可选值：上证、深证、创业板、科创版")):
    """
    获取指定市场的市盈率数据。
    返回指定市场的历史市盈率数据，包含日期、总市值和市盈率。

    Args:
        market: 市场名称，可选值：上证、深证、创业板、科创版

    Returns:
        List[Dict[str, Any]]: 市盈率数据列表
    """
    try:
        # 验证市场参数
        valid_markets = ["上证", "深证", "创业板", "科创版"]
        if market not in valid_markets:
            raise HTTPException(status_code=400, detail=f"无效的市场参数: {market}，有效值为: {', '.join(valid_markets)}")
        
        # 使用akshare获取市场市盈率数据
        try:
            pe_data = ak.stock_market_pe_lg(symbol=market)
            
            # 处理数据格式
            result = []
            for _, row in pe_data.iterrows():
                # 转换日期格式
                date_str = row.get('日期', '')
                # 确保市值和市盈率是数值类型
                total_mv = float(row.get('总市值', 0))
                pe_ratio = float(row.get('平均市盈率', 0))
                
                result.append({
                    "date": date_str,
                    "total_market_value": total_mv,
                    "pe_ratio": pe_ratio
                })
            
            return result
        except Exception as e:
            print(f"获取{market}市盈率数据失败: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch {market} PE ratio data: {str(e)}")
            
    except Exception as e:
        import traceback
        print(f"处理市盈率数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch PE ratio data: {str(e)}")

@router.get("/kline", response_model=List[Dict[str, Any]])
async def get_market_kline(
        market: str = Query(..., description="市场名称，可选值：上证、深证、创业板、科创版"),
        start_date: Optional[str] = Query(None, description="开始日期(YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="结束日期(YYYY-MM-DD)")
    ):
    """
    获取指定市场的K线数据。
    返回指定市场指数的历史K线数据。

    Args:
        market: 市场名称，可选值：上证、深证、创业板、科创版

    Returns:
        List[Dict[str, Any]]: K线数据列表
    """
    try:
        # 验证市场参数
        valid_markets = ["上证", "深证", "创业板", "科创版"]
        market_code_map = {
            "上证": "000001",  # 上证指数
            "深证": "399001",  # 深证成指
            "创业板": "399006",  # 创业板指
            "科创版": "000688"   # 科创50指数
        }
        
        if market not in valid_markets:
            raise HTTPException(status_code=400, detail=f"无效的市场参数: {market}，有效值为: {', '.join(valid_markets)}")
        
        # 获取对应的指数代码
        index_code = market_code_map.get(market)
        
        try:
            # 从daily_index数据库获取K线数据
            from backend.database.connection import get_db
            from backend.services.index_service import IndexService
            from backend.utils.date_utils import parse_date
            
            db = next(get_db())
            index_service = IndexService()
            
            # 解析日期
            start = parse_date(start_date) if start_date else None
            end = parse_date(end_date) if end_date else None
            
            # 获取K线数据
            kline_data = index_service.get_index_kline(db, index_code, start, end)
            
            # 处理数据格式
            result = []
            for item in kline_data.data:
                result.append({
                    "date": item.date.strftime("%Y-%m-%d"),
                    "open": float(item.open),
                    "high": float(item.high),
                    "low": float(item.low),
                    "close": float(item.close),
                    "volume": float(item.volume)
                })
            
            return result
        except Exception as e:
            print(f"获取{market}指数K线数据失败: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch {market} index K-line data: {str(e)}")
    except Exception as e:
        import traceback
        print(f"处理K线数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch K-line data: {str(e)}")

@router.get("/concept-stocks/{concept_name}", response_model=List[Dict[str, Any]])
async def get_concept_stocks(concept_name: str):
    """
    获取概念板块相关个股数据。
    返回指定概念板块的相关个股数据列表。

    Args:
        concept_name: 概念板块名称

    Returns:
        List[Dict[str, Any]]: 概念相关个股数据列表
    """
    try:
        # 使用akshare获取概念板块成分股数据
        stocks_data = ak.stock_board_concept_cons_em(symbol=concept_name)
        
        result = []
        for _, row in stocks_data.iterrows():
            # 提取需要的数据字段
            change_percent = float(row.get('涨跌幅', 0).strip('%')) if isinstance(row.get('涨跌幅'), str) else float(row.get('涨跌幅', 0))
            amplitude = float(row.get('振幅', 0).strip('%')) if isinstance(row.get('振幅'), str) else float(row.get('振幅', 0))
            
            result.append({
                "code": row.get('代码', ''),
                "name": row.get('名称', ''),
                "change_percent": change_percent,
                "amplitude": amplitude,
                "amount": float(row.get('成交额', 0)),
                "turnover_rate": float(row.get('换手率', 0).strip('%')) if isinstance(row.get('换手率'), str) else float(row.get('换手率', 0))
            })
        
        return result
    except Exception as e:
        import traceback
        print(f"获取概念板块({concept_name})相关个股数据失败: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch concept stocks: {str(e)}")