# TradeMentor

A React + TypeScript web app for tracking Colombo Stock Exchange (CSE) investments, with a muted dark-theme UI.

## Features

- Dashboard of key CSE stocks (COMB, JKH, HNB, SAMP, LOLC) with live-style price, change %, and fundamentals (P/E, P/B, ROE, dividend yield, EPS growth)
- Candlestick price charts per stock (via `lightweight-charts`)
- A simple rules-based buy/hold/sell signal derived from valuation, profitability, and momentum
- Muted dark theme throughout

Stock and price data is simulated for demonstration purposes and is not sourced from live CSE feeds.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build
