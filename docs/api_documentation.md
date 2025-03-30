# 股票数据可视化 API 文档

## 概述
本 API 提供获取和分析股票市场数据的功能，使用户能够可视化股票趋势和模式。

## 基础 URL
```
http://localhost:8000/api/v1
```

## 认证
所有 API 端点都需要使用 Bearer token 进行认证。

## 接口列表

### 股票数据

#### 获取股票列表
```http
GET /stocks
```
返回可用的股票列表。

**响应示例**
```json
{
    "stocks": [
        {
            "symbol": "AAPL",
            "name": "苹果公司",
            "exchange": "纳斯达克"
        }
    ]
}
```

#### 获取股票历史数据
```http
GET /stocks/{symbol}/history
```
返回特定股票的历史价格数据。

**参数说明**
- `symbol`: 股票代码（例如：AAPL）
- `start_date`: 开始日期（YYYY-MM-DD）
- `end_date`: 结束日期（YYYY-MM-DD）
- `interval`: 数据间隔（1d-日线，1w-周线，1m-月线）

**响应示例**
```json
{
    "symbol": "AAPL",
    "data": [
        {
            "date": "2024-01-01",
            "open": 150.00,
            "high": 155.00,
            "low": 149.00,
            "close": 153.00,
            "volume": 1000000
        }
    ]
}
```

### 技术分析

#### 获取技术指标
```http
GET /stocks/{symbol}/indicators
```
返回特定股票的技术指标数据。

**参数说明**
- `symbol`: 股票代码
- `period`: 计算周期（默认：14）
- `indicators`: 指标列表（例如：["MA", "RSI", "MACD"]）

**响应示例**
```json
{
    "symbol": "AAPL",
    "indicators": {
        "MA": {
            "20": [...],
            "50": [...],
            "200": [...]
        },
        "RSI": [...],
        "MACD": {
            "macd": [...],
            "signal": [...],
            "histogram": [...]
        }
    }
}
```

### 市场分析

#### 获取市场概览
```http
GET /market/overview
```
返回整体市场统计数据和趋势。

**响应示例**
```json
{
    "market_status": "open",
    "major_indices": {
        "S&P 500": {...},
        "NASDAQ": {...},
        "DOW": {...}
    },
    "market_trend": "bullish",
    "top_gainers": [...],
    "top_losers": [...]
}
```

## 错误响应
所有接口可能返回以下错误响应：

```json
{
    "error": {
        "code": "错误代码",
        "message": "错误描述",
        "details": {}
    }
}
```

常见错误代码：
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源未找到
- 500: 服务器内部错误

## 访问限制
API 请求限制为每个用户每分钟 100 次。
