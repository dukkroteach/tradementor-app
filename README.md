# TradeMentor

A React + TypeScript web app for tracking Colombo Stock Exchange (CSE) investments, with a muted dark-theme UI.

## Features

- Dashboard of key CSE stocks (COMB, JKH, HNB, SAMP, LOLC) with price, change %, and fundamentals (P/E, P/B, ROE, dividend yield, EPS growth)
- Candlestick price charts per stock (via `lightweight-charts`), backed by real CSE trade history when reachable
- A simple rules-based buy/hold/sell signal derived from valuation, profitability, and momentum
- An Admin screen (`#admin`) for manually entering/overriding price and fundamentals per stock, including bulk import from a CSV file
- A rule-based Stock Assistant chatbot (`#chat`) that answers questions about price, fundamentals, and signals for your stocks
- Per-stock reference image/screenshot attachments in the Admin screen, shown in the detail panel
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

## Admin screen (manual data overrides)

Click **Admin** in the header (or visit `#admin`) to manually enter price, change, change %, P/E, P/B, ROE,
dividend yield, and EPS growth for any stock. Saved values take priority over live and simulated data everywhere
in the app — the watchlist, the detail panel, the buy/hold/sell signal, and the candlestick chart (the chart's
latest candle is synthesized to match a manually entered price). Each stock shows a "Manual" badge wherever an
override is active. Use **Reset to live/simulated** on a stock, or **Clear all overrides**, to remove overrides.

**Overrides are stored in this browser's `localStorage` only.** There is no backend, so:

- They persist across reloads and visits on the same browser/device.
- They are **not** shared with other visitors to the deployed site, and won't show up if you open the app on a
  different browser or device.
- Clearing site data/browser storage erases them.

### CSV import

From the Admin screen, click **Download template** for a CSV pre-filled with the current value for every stock,
or upload your own with a header row and these columns (case-insensitive, order doesn't matter):

```
symbol,price,change%,pe,pb,roe,dividendYield,epsGrowth
COMB,150.25,1.5,4.1,0.75,20.2,7.5,12.1
```

- `symbol` must match one of the app's known tickers (COMB, JKH, HNB, SAMP, LOLC); unrecognized symbols are
  skipped with a warning, not an error — the rest of the file still imports.
- Any column can be omitted per row; omitted or non-numeric values are left unchanged rather than zeroed out or
  aborting the import, and a warning lists exactly which rows/fields were skipped.
- If `change%` is given without an absolute `change`, the absolute change is derived from `price` and `change%`
  automatically.
- Imported rows are saved as the same manual overrides described above — same priority, same persistence
  (localStorage, this browser only), same "Manual" badge, and they show up pre-filled in the per-stock edit forms
  so you can fine-tune after a bulk import.

### Reference image attachments

Each stock in the Admin screen has an **Reference image** field where you can upload a screenshot — e.g. from
your broker app or a news article — as supporting context for why you entered certain values. It shows up in
that stock's detail panel on the dashboard; click the thumbnail to view it full-size.

- Images are downscaled and JPEG-compressed client-side (max 800px, ~70% quality) before being stored, to keep
  them small in a storage medium that has no room for full-resolution screenshots across several stocks.
- Like everything else with no backend, attachments live in this browser's `localStorage` only — not shared
  across devices or visitors. If storage is full, the upload fails with an on-screen error instead of silently
  losing data; removing an old attachment or using a smaller image resolves it.
- Attachments have their own lifecycle, independent of manual data overrides: "Reset to live/simulated" and
  "Clear all overrides" do not remove an attached image — use **Remove** under the image itself for that.

## Stock Assistant (chatbot)

Click **Chat** in the header (or visit `#chat`) to ask questions like "What's COMB's P/E?", "Should I buy JKH?",
"Compare HNB and SAMP", or "Which stock has the highest ROE?". It answers from whatever data is currently loaded
(live, simulated, or manually overridden/CSV-imported) — the same numbers shown on the dashboard.

This is a **rule-based assistant, not a general AI**: it pattern-matches your question against the known stock
symbols and a fixed set of metrics/intents (price, change, P/E, P/B, ROE, dividend yield, EPS growth, buy/hold/sell
signal, comparisons, highest/lowest lookups). There is no external API call and no API key involved — deliberately,
since this app has no backend to keep a key safe from a public deployment. It can't hold an open-ended conversation
or answer anything outside these stocks and metrics.

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
