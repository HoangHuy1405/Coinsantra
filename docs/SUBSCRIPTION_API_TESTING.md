# Subscription API Testing Guide

## Overview

Two endpoints for managing user bot subscriptions: listing all subscriptions and viewing detailed metrics.

---

## 1. Get All User Subscriptions

**Endpoint:** `GET /api/v1/bot-sub`

**Query Parameters:**

- `sortBy` (optional): `pnl`, `equity`, or `bot` (default: `pnl`)
- `page` (optional): Page number, 0-indexed (default: `0`)
- `size` (optional): Items per page (default: `10`)

**Authentication:** Required (JWT token in Authorization header)

### Test Cases

#### Test 1: Get all subscriptions sorted by PnL

```bash
GET http://localhost:8080/api/v1/bot-sub?sortBy=pnl&page=0&size=10
Authorization: Bearer <your-jwt-token>
```

**Expected Response (200 OK):**

```json
{
  "content": [
    {
      "subscriptionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "botName": "Scalping Master Pro",
      "tradingPair": "BTC/USDT",
      "coin": "BTC",
      "isActive": true,
      "totalEquity": 15234.56,
      "pnl": 1234.56
    },
    {
      "subscriptionId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "botName": "Swing Trader Alpha",
      "tradingPair": "ETH/USDT",
      "coin": "ETH",
      "isActive": false,
      "totalEquity": 8900.0,
      "pnl": -150.0
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 2,
  "totalPages": 1
}
```

#### Test 2: Sort by bot name

```bash
GET http://localhost:8080/api/v1/bot-sub?sortBy=bot&page=0&size=5
```

---

## 2. Get Subscription Details

**Endpoint:** `GET /api/v1/bot-sub/{subId}`

**Path Parameters:**

- `subId` (required): UUID of the subscription

**Query Parameters:**

- `timeframe` (optional): `1d`, `7d`, or `current` (default: `current`)

**Authentication:** Required

### Test Cases

#### Test 3: Get detailed metrics for a subscription

```bash
GET http://localhost:8080/api/v1/bot-sub/a1b2c3d4-e5f6-7890-abcd-ef1234567890?timeframe=7d
Authorization: Bearer <your-jwt-token>
```

**Expected Response (200 OK):**

```json
{
  "subscriptionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "u1s2e3r4-i5d6-7890-abcd-ef1234567890",
  "botId": "b0t1i2d3-4567-8901-abcd-ef1234567890",
  "botName": "Scalping Master Pro",
  "tradingPair": "BTC/USDT",
  "coin": "BTC",
  "isActive": true,
  "netInvestment": 10000.0,
  "totalEquity": 15234.56,
  "pnl": 5234.56,
  "roi": 52.35,
  "maxDrawdown": 450.0,
  "maxDrawdownPercent": 4.5,
  "botWalletBalance": 0.5,
  "botWalletCoin": "BTC",
  "tradePercentage": 5.0,
  "maxDailyLossPercentage": 2.0,
  "chartData": [
    {
      "timestamp": "2025-11-23T10:00:00Z",
      "pnl": 234.5
    },
    {
      "timestamp": "2025-11-24T10:00:00Z",
      "pnl": 456.78
    },
    {
      "timestamp": "2025-11-30T10:00:00Z",
      "pnl": 5234.56
    }
  ]
}
```

---

## Database Compatibility

Both APIs use **JPQL** queries with text blocks, ensuring compatibility with:

- **MySQL** (local development)
- **MSSQL** (production environment)

No database-specific SQL functions are used.

---

## Common Error Responses

**401 Unauthorized:**

```json
{
  "error": "User not authenticated"
}
```

**404 Not Found:**

```json
{
  "error": "Subscription not found"
}
```
