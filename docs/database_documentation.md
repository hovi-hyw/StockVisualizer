# 股票数据可视化系统 - 数据库文档

## 目录

1. [数据库概述](#数据库概述)
2. [数据库架构](#数据库架构)
3. [表结构设计](#表结构设计)
   - [stocks表](#stocks表)
   - [stock_prices表](#stock_prices表)
   - [indices表](#indices表)
   - [index_prices表](#index_prices表)
   - [market_news表](#market_news表)
   - [industry_sectors表](#industry_sectors表)
   - [concept_sectors表](#concept_sectors表)
4. [数据关系](#数据关系)
5. [查询示例](#查询示例)
6. [数据维护](#数据维护)

## 数据库概述

股票数据可视化系统使用PostgreSQL关系型数据库存储和管理数据。数据库主要存储股票基本信息、历史价格数据、市场指数、行业板块和市场新闻等信息。

### 设计原则

- **数据完整性**：使用主键、外键和约束确保数据的完整性和一致性
- **查询效率**：针对常用查询创建适当的索引，优化查询性能
- **可扩展性**：表结构设计考虑未来可能的扩展需求
- **数据冗余控制**：合理设计表结构，减少不必要的数据冗余

## 数据库架构

系统数据库主要包含以下几个部分：

1. **股票数据**：存储股票基本信息和历史价格数据
2. **指数数据**：存储市场指数基本信息和历史数据
3. **板块数据**：存储行业板块和概念板块信息
4. **市场新闻**：存储市场相关新闻和公告

## 表结构设计

### stocks表

存储股票的基本信息。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| symbol | VARCHAR(10) | 股票代码 | PRIMARY KEY |
| name | VARCHAR(50) | 股票名称 | NOT NULL |
| listing_date | DATE | 上市日期 | |
| industry | VARCHAR(50) | 所属行业 | |
| total_share | BIGINT | 总股本 | |
| circulating_share | BIGINT | 流通股本 | |
| description | TEXT | 公司简介 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：
- PRIMARY KEY (symbol)
- INDEX idx_stock_industry (industry)
- INDEX idx_stock_name (name)

### stock_prices表

存储股票的历史价格数据。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| id | SERIAL | 自增ID | PRIMARY KEY |
| symbol | VARCHAR(10) | 股票代码 | REFERENCES stocks(symbol) |
| trade_date | DATE | 交易日期 | NOT NULL |
| open | DECIMAL(10,2) | 开盘价 | |
| high | DECIMAL(10,2) | 最高价 | |
| low | DECIMAL(10,2) | 最低价 | |
| close | DECIMAL(10,2) | 收盘价 | NOT NULL |
| volume | BIGINT | 成交量 | |
| turnover | DECIMAL(16,2) | 成交额 | |
| change_percent | DECIMAL(6,2) | 涨跌幅 | |

**索引**：
- PRIMARY KEY (id)
- UNIQUE INDEX idx_stock_price_date (symbol, trade_date)
- INDEX idx_stock_price_symbol (symbol)
- INDEX idx_stock_price_date (trade_date)

### indices表

存储市场指数的基本信息。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| symbol | VARCHAR(10) | 指数代码 | PRIMARY KEY |
| name | VARCHAR(50) | 指数名称 | NOT NULL |
| launch_date | DATE | 发布日期 | |
| description | TEXT | 指数描述 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：
- PRIMARY KEY (symbol)
- INDEX idx_index_name (name)

### index_prices表

存储市场指数的历史数据。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| id | SERIAL | 自增ID | PRIMARY KEY |
| symbol | VARCHAR(10) | 指数代码 | REFERENCES indices(symbol) |
| trade_date | DATE | 交易日期 | NOT NULL |
| open | DECIMAL(10,2) | 开盘点位 | |
| high | DECIMAL(10,2) | 最高点位 | |
| low | DECIMAL(10,2) | 最低点位 | |
| close | DECIMAL(10,2) | 收盘点位 | NOT NULL |
| volume | BIGINT | 成交量 | |
| turnover | DECIMAL(16,2) | 成交额 | |
| change_percent | DECIMAL(6,2) | 涨跌幅 | |

**索引**：
- PRIMARY KEY (id)
- UNIQUE INDEX idx_index_price_date (symbol, trade_date)
- INDEX idx_index_price_symbol (symbol)
- INDEX idx_index_price_date (trade_date)

### market_news表

存储市场相关新闻和公告。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| id | SERIAL | 自增ID | PRIMARY KEY |
| title | VARCHAR(200) | 新闻标题 | NOT NULL |
| content | TEXT | 新闻内容 | |
| source | VARCHAR(50) | 新闻来源 | |
| publish_time | TIMESTAMP | 发布时间 | NOT NULL |
| related_symbols | VARCHAR[] | 相关股票代码 | |
| importance | INT | 重要性等级 | DEFAULT 0 |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：
- PRIMARY KEY (id)
- INDEX idx_news_publish_time (publish_time)
- INDEX idx_news_importance (importance)

### industry_sectors表

存储行业板块信息。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| id | SERIAL | 自增ID | PRIMARY KEY |
| name | VARCHAR(50) | 行业名称 | NOT NULL |
| code | VARCHAR(20) | 行业代码 | UNIQUE |
| description | TEXT | 行业描述 | |
| stock_count | INT | 包含股票数量 | DEFAULT 0 |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：
- PRIMARY KEY (id)
- UNIQUE INDEX idx_industry_code (code)
- INDEX idx_industry_name (name)

### concept_sectors表

存储概念板块信息。

| 字段名 | 数据类型 | 说明 | 约束 |
|-------|---------|------|------|
| id | SERIAL | 自增ID | PRIMARY KEY |
| name | VARCHAR(50) | 概念名称 | NOT NULL |
| code | VARCHAR(20) | 概念代码 | UNIQUE |
| description | TEXT | 概念描述 | |
| stock_count | INT | 包含股票数量 | DEFAULT 0 |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：
- PRIMARY KEY (id)
- UNIQUE INDEX idx_concept_code (code)
- INDEX idx_concept_name (name)

## 数据关系

系统数据库中的主要数据关系如下：

1. **股票与股票价格**：一对多关系，一个股票有多条历史价格记录
   - stocks.symbol → stock_prices.symbol

2. **指数与指数价格**：一对多关系，一个指数有多条历史价格记录
   - indices.symbol → index_prices.symbol

3. **股票与行业**：多对一关系，多个股票属于同一个行业
   - stocks.industry → industry_sectors.name

4. **股票与概念**：多对多关系，一个股票可以属于多个概念，一个概念可以包含多个股票
   - 通过中间表stock_concept_relation实现

## 查询示例

以下是一些常用的数据库查询示例：

### 获取股票列表（分页和搜索）

```sql
SELECT s.symbol, s.name, sp.close AS current_price, sp.change_percent
FROM stocks s
LEFT JOIN (
    SELECT symbol, close, change_percent
    FROM stock_prices
    WHERE trade_date = (SELECT MAX(trade_date) FROM stock_prices)
) sp ON s.symbol = sp.symbol
WHERE s.symbol LIKE '%搜索关键字%' OR s.name LIKE '%搜索关键字%'
ORDER BY s.symbol
LIMIT 20 OFFSET (页码 - 1) * 20;
```

### 获取股票K线数据

```sql
SELECT trade_date, open, high, low, close, volume, turnover
FROM stock_prices
WHERE symbol = '600000'
AND trade_date BETWEEN '2024-01-01' AND '2024-03-01'
ORDER BY trade_date;
```

### 获取热门行业

```sql
SELECT i.name, 
       AVG(sp.change_percent) AS avg_change_percent,
       COUNT(s.symbol) AS stock_count
FROM industry_sectors i
JOIN stocks s ON i.name = s.industry
JOIN stock_prices sp ON s.symbol = sp.symbol
WHERE sp.trade_date = (SELECT MAX(trade_date) FROM stock_prices)
GROUP BY i.name
ORDER BY avg_change_percent DESC
LIMIT 10;
```

## 数据维护

### 数据备份

系统定期对数据库进行备份，备份策略如下：

- **全量备份**：每周一次
- **增量备份**：每天一次
- **备份保留期**：全量备份保留30天，增量备份保留7天

### 数据更新

系统通过定时任务更新数据：

- **股票和指数实时数据**：交易时段每分钟更新一次
- **历史数据**：每天收盘后更新
- **市场新闻**：每小时更新一次

### 数据清理

系统定期清理过期或无用的数据：

- **临时数据**：每天清理
- **日志数据**：保留30天
- **历史数据**：不删除，但可能会进行归档处理

---

本文档最后更新于：2025-03-18