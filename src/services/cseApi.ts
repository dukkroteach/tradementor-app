import type { Candle } from '../types/stock'

// CSE has no official public API. This targets the unofficial, reverse-engineered
// endpoints that the cse.lk website itself calls (see README for details and caveats:
// no documented rate limits, no CORS guarantee, and endpoints may change without notice).
// VITE_CSE_API_BASE lets a CORS-safe proxy be swapped in without touching this file.
const API_BASE = (import.meta.env.VITE_CSE_API_BASE as string | undefined)?.replace(/\/$/, '') || 'https://www.cse.lk/api'

const REQUEST_TIMEOUT_MS = 8000

interface CseChartPoint {
  t: number // epoch ms
  o: number
  h: number
  l: number
  c: number
  q?: number // quantity traded
  s?: number // shares traded
}

interface CompanyChartDataResponse {
  reqTradeSummery?: {
    chartData?: CseChartPoint[]
  }
}

async function postForm(path: string, params: Record<string, string>): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`CSE API request to ${path} failed with status ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Fetches real OHLC candle history for a CSE-listed stock, e.g. "COMB.N0000". */
export async function fetchCseCandles(cseSymbol: string): Promise<Candle[]> {
  const data = (await postForm('companyChartDataByStock', { symbol: cseSymbol })) as CompanyChartDataResponse
  const points = data?.reqTradeSummery?.chartData

  if (!Array.isArray(points) || points.length === 0) {
    throw new Error(`No live chart data returned for ${cseSymbol}`)
  }

  const candles = points
    .filter((p) => isFiniteNumber(p.o) && isFiniteNumber(p.h) && isFiniteNumber(p.l) && isFiniteNumber(p.c) && isFiniteNumber(p.t))
    .map(
      (p): Candle => ({
        time: new Date(p.t).toISOString().slice(0, 10),
        open: p.o,
        high: p.h,
        low: p.l,
        close: p.c,
        volume: p.q ?? p.s ?? 0,
      }),
    )
    .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0))

  if (candles.length < 2) {
    throw new Error(`Not enough usable candles returned for ${cseSymbol}`)
  }

  return candles
}
