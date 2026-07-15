# TradeMentor

A React + TypeScript web app for tracking Colombo Stock Exchange (CSE) investments, with a muted dark-theme UI.

## Features

- Dashboard of key CSE stocks (COMB, JKH, HNB, SAMP, LOLC) with price, change %, and fundamentals (P/E, P/B, ROE, dividend yield, EPS growth)
- Candlestick price charts per stock (via `lightweight-charts`), backed by real CSE trade history when reachable
- A simple rules-based buy/hold/sell signal derived from valuation, profitability, and momentum
- Muted dark theme throughout

## Data sources

**Price and candlestick data** is fetched live from CSE's public website API (`cse.lk/api/companyChartDataByStock`)
on load and every 60 seconds. This is an **unofficial, reverse-engineered API** — CSE does not publish an official
public API or developer docs. Because of that:

- There's no documented rate limit, uptime guarantee, or CORS policy, so requests from a browser may fail.
- Endpoints can change or disappear without notice.

If the live request fails for any reason (CORS, network error, timeout, endpoint change), the app **falls back to
simulated data for that stock** and shows a "Simulated" badge next to it, so it's never silently wrong. A "Live" /
"Simulated" / "Loading" indicator is shown per stock and in the header.

**Fundamentals (P/E, P/B, ROE, dividend yield, EPS growth)** are illustrative static figures, not live. No free
source publishes real-time, per-stock fundamental ratios for CSE-listed companies — CSE's own API only exposes
market-wide aggregates, not per-company ratios. This is called out in the UI.

### Pointing at a CORS proxy

Because this app is a static site (no backend), direct browser calls to `cse.lk` depend on CSE allowing
cross-origin requests, which is unverified and may not hold in production. If live data isn't loading for you,
the most robust fix is to deploy a small proxy (e.g. a Cloudflare Worker) that forwards requests to
`https://www.cse.lk/api/*` and adds permissive CORS headers, then point the app at it — no other code changes
needed:

```bash
# .env.local, or as a build-time env var in CI
VITE_CSE_API_BASE=https://your-proxy.example.workers.dev/api
```

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
