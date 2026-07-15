import { useCallback, useEffect, useState } from 'react'
import { STOCK_SEEDS, buildSimulatedStock, type StockSeed } from '../data/cseStocks'
import { fetchCseCandles } from '../services/cseApi'
import type { Stock } from '../types/stock'

const REFRESH_INTERVAL_MS = 60_000

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

async function loadStock(seed: StockSeed): Promise<Stock> {
  const candles = await fetchCseCandles(seed.cseSymbol)
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]

  return {
    symbol: seed.symbol,
    name: seed.name,
    sector: seed.sector,
    price: last.close,
    change: round2(last.close - prev.close),
    changePercent: round2(((last.close - prev.close) / prev.close) * 100),
    fundamentals: seed.fundamentals,
    candles,
    dataSource: 'live',
  }
}

export function useCseStocks() {
  const [stocks, setStocks] = useState<Stock[]>(() =>
    STOCK_SEEDS.map((seed) => ({ ...buildSimulatedStock(seed), dataSource: 'loading' })),
  )
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      const results = await Promise.all(
        STOCK_SEEDS.map(async (seed): Promise<Stock> => {
          try {
            return await loadStock(seed)
          } catch {
            // CSE's API is unofficial and may be unreachable (CORS, downtime, rate limit,
            // or an endpoint change) — fall back to simulated data for that stock only.
            return buildSimulatedStock(seed)
          }
        }),
      )

      if (!cancelled) {
        setStocks(results)
        setLastRefreshedAt(new Date())
      }
    }

    loadAll()
    const interval = setInterval(loadAll, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [refreshToken])

  return { stocks, lastRefreshedAt, refresh }
}
