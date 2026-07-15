import type { Candle, ManualOverride, Stock } from '../types/stock'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Replaces (or appends) today's candle so the chart's last point matches a manually
 * entered price, instead of showing a stale live/simulated close next to the header price.
 */
function applyManualPriceToCandles(candles: Candle[], manualPrice: number): Candle[] {
  if (candles.length === 0) return candles

  const today = new Date().toISOString().slice(0, 10)
  const last = candles[candles.length - 1]
  const isToday = last.time === today

  const open = isToday ? last.open : last.close
  const high = Math.max(isToday ? last.high : open, manualPrice)
  const low = Math.min(isToday ? last.low : open, manualPrice)
  const synthetic: Candle = { time: today, open, high, low, close: round2(manualPrice), volume: last.volume }

  return isToday ? [...candles.slice(0, -1), synthetic] : [...candles, synthetic]
}

function hasAnyOverrideField(override: ManualOverride): boolean {
  return (
    override.price !== undefined ||
    override.change !== undefined ||
    override.changePercent !== undefined ||
    override.pe !== undefined ||
    override.pb !== undefined ||
    override.roe !== undefined ||
    override.dividendYield !== undefined ||
    override.epsGrowth !== undefined
  )
}

/** Overlays manually-entered fields onto a live/simulated stock. Present override fields win. */
export function applyManualOverride(stock: Stock, override: ManualOverride | undefined): Stock {
  if (!override || !hasAnyOverrideField(override)) return stock

  return {
    ...stock,
    price: override.price ?? stock.price,
    change: override.change ?? stock.change,
    changePercent: override.changePercent ?? stock.changePercent,
    fundamentals: {
      pe: override.pe ?? stock.fundamentals.pe,
      pb: override.pb ?? stock.fundamentals.pb,
      roe: override.roe ?? stock.fundamentals.roe,
      dividendYield: override.dividendYield ?? stock.fundamentals.dividendYield,
      epsGrowth: override.epsGrowth ?? stock.fundamentals.epsGrowth,
    },
    candles: override.price !== undefined ? applyManualPriceToCandles(stock.candles, override.price) : stock.candles,
    dataSource: 'manual',
  }
}
