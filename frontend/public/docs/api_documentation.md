# API 文档

## 概述

本文档详细介绍了股票可视化平台的API接口，包括请求方法、参数和返回值。

## 基础信息

- 基础URL: `/api/v1`
- 所有请求和响应均使用JSON格式
- 认证方式: Bearer Token

## 股票数据API

### 获取股票列表

```
GET /api/v1/stocks
```

**参数:**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|------|
| page | Integer | 否 | 页码，默认为1 |
| limit | Integer | 否 | 每页数量，默认为20 |
| industry | String | 否 | 按行业筛选 |

**响应:**

```json
{
  "code": 200,
  "data": [
    {
      "code": "000001",
      "name": "平安银行",
      "current": 10.25,
      "change": 0.25,
      "change_percent": 2.5,
      "volume": 12500000,
      "amount": 128125000,
      "industry": "银行"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 获取股票详情

```
GET /api/v1/stocks/{code}
```

**参数:**

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|------|------|
| code | String | 是 | 股票代码 |

**响应:**

```json
{
  "code": 200,
  "data": {
    "code": "000001",
    "name": "平安银行",
    "current": 10.25,
    "open": 10.00,
    "high": 10.50,
    "low": 9.90,
    "close": 10.25,
    "volume": 12500000,
    "amount": 128125000,
    "change": 0.25,
    "change_percent": 2.5,
    "market_cap": 1990000000,
    "pe_ratio": 12.5,
    "industry": "银行",
    "description": "平安银行股份有限公司是中国平安保险集团股份有限公司控股的一家股份制商业银行"
  }
}
```

## 错误码

| 错误码 | 描述 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

```javascript
// 获取股票列表示例
async function getStockList() {
  try {
    const response = await axios.get('/api/v1/stocks', {
      params: {
        page: 1,
        limit: 10,
        industry: '银行'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('获取股票列表失败:', error);
  }
}
```