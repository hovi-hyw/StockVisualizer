# backend/api/fund_api.py
"""
此模块定义了基金数据相关的API端点。
提供获取基金列表、基金详情和基金净值数据的API接口。
Authors: hovi.hyw & AI
Date: 2025-04-02
更新: 2025-04-10 - 添加价值ETF列表API端点
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import akshare as ak
import pandas as pd

from backend.database.connection import get_db
from backend.services.etf_service import ETFService

router = APIRouter(prefix="/funds", tags=["funds"])
etf_service = ETFService()

@router.get("/value-etfs", response_model=List[Dict[str, Any]])
async def get_value_etfs(
        sort_by: Optional[str] = Query(None, description="排序字段，可选值：name, price, change"),
        sort_order: Optional[str] = Query("desc", description="排序顺序，可选值：asc, desc"),
        db: Session = Depends(get_db)
):
    """
    获取价值型ETF列表。
    使用akshare获取ETF实时数据，并筛选出高成交额高振幅ETF列表中的ETF。
    返回所有符合条件的ETF，并支持按名称、价格和涨跌幅排序。

    Args:
        sort_by: 排序字段，可选值：name(名称), price(金额), change(涨幅)
        sort_order: 排序顺序，可选值：asc(升序), desc(降序)，默认为desc
        db: 数据库会话

    Returns:
        List[Dict[str, Any]]: 价值型ETF列表
    """
    try:
        # 首先获取高成交额高振幅ETF列表作为筛选基础
        high_volume_etfs = etf_service.get_high_volume_etf_list(db, page=1, page_size=100)
        high_volume_symbols = [item["symbol"] for item in high_volume_etfs["items"]]
        
        # 使用akshare获取ETF实时数据
        try:
            etf_df = ak.fund_etf_spot_em()
            # 筛选出A表中的ETF（高成交额高振幅ETF列表中的ETF）
            filtered_etfs = []
            for _, row in etf_df.iterrows():
                # 提取ETF代码（去掉前缀）
                code = row["代码"]
                symbol = code
                
                # 检查是否在高成交额高振幅ETF列表中
                if symbol in high_volume_symbols:
                    etf_item = {
                        "code": code,
                        "name": row["名称"],
                        "change": f"{row['涨跌幅']}%" if '涨跌幅' in row else "0.00%",
                        "price": float(row["最新价"]) if '最新价' in row else 0.0,
                        "type": "价值型"
                    }
                    filtered_etfs.append(etf_item)
            
            # 根据指定字段排序
            if sort_by:
                # 处理涨跌幅排序（需要去掉百分号）
                if sort_by == "change":
                    filtered_etfs.sort(key=lambda x: float(x["change"].replace("%", "")), reverse=(sort_order.lower() == "desc"))
                else:
                    filtered_etfs.sort(key=lambda x: x[sort_by], reverse=(sort_order.lower() == "desc"))
            
            return filtered_etfs
        except Exception as e:
            print(f"获取ETF实时数据失败: {e}")
            # 如果akshare获取失败，则直接返回高成交额高振幅ETF列表
            result = []
            for item in high_volume_etfs["items"]:
                result.append({
                    "code": item["symbol"],
                    "name": item["name"],
                    "change": f"{item['change_rate']:.2f}%",
                    "price": item["latest_price"],
                    "type": "价值型"
                })
                
            # 根据指定字段排序
            if sort_by:
                # 处理涨跌幅排序（需要去掉百分号）
                if sort_by == "change":
                    result.sort(key=lambda x: float(x["change"].replace("%", "")), reverse=(sort_order.lower() == "desc"))
                else:
                    result.sort(key=lambda x: x[sort_by], reverse=(sort_order.lower() == "desc"))
                    
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))