# 股票数据可视化 API 文档

## 概述
本 API 提供获取和分析股票市场数据的功能，使用户能够可视化股票趋势和模式。系统支持股票和指数数据的查询、K线图数据获取等功能。

## 基础 URL
```
http://localhost:8000/api
```

## 认证
当前版本API不需要认证即可访问。未来版本可能会添加认证机制。

## 接口列表

### 股票数据

#### 获取股票列表
```http
GET /stocks
```
返回可用的股票列表，支持分页和搜索。

**参数说明**
- `page`: 页码，默认为1
- `page_size`: 每页数量，默认为20，最大为100
- `search`: 搜索关键字，可搜索股票代码或名称

**响应示例**
```json
{
    "items": [
        {
            "symbol": "600000",
            "name": "浦发银行",
            "current_price": 8.23,
            "change_percent": 0.86,
            "volume": 12345678,
            "turnover": 98765432
        }
    ],
    "total": 4823,
    "page": 1,
    "page_size": 20,
    "pages": 242
}
```

#### 获取股票K线数据
```http
GET /stocks/{symbol}/kline
```
返回特定股票的K线数据，用于绘制K线图。

**参数说明**
- `symbol`: 股票代码（例如：600000）
- `start_date`: 开始日期（YYYY-MM-DD），可选
- `end_date`: 结束日期（YYYY-MM-DD），可选

**响应示例**
```json
{
    "symbol": "600000",
    "name": "浦发银行",
    "data": [
        {
            "date": "2024-01-01",
            "open": 8.12,
            "high": 8.25,
            "low": 8.08,
            "close": 8.23,
            "volume": 12345678,
            "turnover": 98765432
        }
    ]
}
```

### 指数数据

#### 获取指数列表
```http
GET /indices
```
返回可用的指数列表，支持分页和搜索。

**参数说明**
- `page`: 页码，默认为1
- `page_size`: 每页数量，默认为20，最大为100
- `search`: 搜索关键字，可搜索指数代码或名称

**响应示例**
```json
{
    "items": [
        {
            "symbol": "000001",
            "name": "上证指数",
            "current_price": 3123.45,
            "change_percent": 0.56,
            "volume": 123456789,
            "turnover": 987654321
        }
    ],
    "total": 120,
    "page": 1,
    "page_size": 20,
    "pages": 6
}
```

#### 获取指数详情
```http
GET /indices/{symbol}
```
返回特定指数的详细信息。

**参数说明**
- `symbol`: 指数代码（例如：000001）

**响应示例**
```json
{
    "symbol": "000001",
    "name": "上证指数",
    "current_price": 3123.45,
    "change": 17.32,
    "change_percent": 0.56,
    "open": 3110.23,
    "high": 3130.45,
    "low": 3105.67,
    "volume": 123456789,
    "turnover": 987654321,
    "update_time": "2024-03-12 15:00:00"
}
```

#### 获取指数K线数据
```http
GET /indices/{symbol}/kline
```
返回特定指数的K线数据，用于绘制K线图。

**参数说明**
- `symbol`: 指数代码（例如：000001）
- `start_date`: 开始日期（YYYY-MM-DD），可选
- `end_date`: 结束日期（YYYY-MM-DD），可选

**响应示例**
```json
{
    "symbol": "000001",
    "name": "上证指数",
    "data": [
        {
            "date": "2024-01-01",
            "open": 3110.23,
            "high": 3130.45,
            "low": 3105.67,
            "close": 3123.45,
            "volume": 123456789,
            "turnover": 987654321
        }
    ]
}
```

### 股票详情

#### 获取股票详情
```http
GET /stocks/{symbol}
```
返回特定股票的详细信息。

**参数说明**
- `symbol`: 股票代码（例如：600000）

**响应示例**
```json
{
    "symbol": "600000",
    "name": "浦发银行",
    "current_price": 8.23,
    "change": 0.07,
    "change_percent": 0.86,
    "open": 8.18,
    "high": 8.25,
    "low": 8.16,
    "volume": 12345678,
    "turnover": 98765432,
    "pe_ratio": 10.5,
    "market_cap": 24000000000,
    "update_time": "2024-03-12 15:00:00"
}
```

## 错误响应
所有接口可能返回以下错误响应：

```json
{
    "detail": "错误描述"
}
```

常见错误状态码：
- 400: 请求参数错误（例如：参数格式不正确）
- 404: 资源未找到（例如：股票代码不存在）
- 422: 请求实体无法处理（例如：日期格式错误）
- 500: 服务器内部错误

## 性能说明
- API响应时间通常在100ms以内
- 大量数据查询（如长时间段的K线数据）可能需要更长的响应时间
- 建议客户端实现适当的缓存机制，减少重复请求

## 版本控制
当前API版本为v1。未来版本更新将通过URL路径中的版本号标识，例如：`/api/v2/stocks`。
