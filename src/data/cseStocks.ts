import type { Candle, Fundamentals, Stock } from '../types/stock'
import { mulberry32, seedFromString } from '../utils/random'

interface StockSeed {
  symbol: string
  name: string
  sector: string
  basePrice: number
  fundamentals: Fundamentals
  volatility: number // daily % swing scale
  drift: number // slight upward/downward bias per day, %
}

const STOCK_SEEDS: StockSeed[] = [
  {
    symbol: 'COMB',
    name: 'Commercial Bank of Ceylon PLC',
    sector: 'Banking',
    basePrice: 118.5,
    fundamentals: { pe: 6.2, pb: 0.9, roe: 15.1, dividendYield: 6.8, epsGrowth: 9.4 },
    volatility: 1.3,
    drift: 0.03,
  },
  {
    symbol: 'JKH',
    name: 'John Keells Holdings PLC',
    sector: 'Diversified',
    basePrice: 196.25,
    fundamentals: { pe: 14.8, pb: 1.4, roe: 9.6, dividendYield: 1.9, epsGrowth: 4.1 },
    volatility: 1.6,
    drift: 0.02,
  },
  {
    symbol: 'HNB',
    name: 'Hatton National Bank PLC',
    sector: 'Banking',
    basePrice: 232.0,
    fundamentals: { pe: 5.4, pb: 0.8, roe: 16.3, dividendYield: 7.2, epsGrowth: 11.2 },
    volatility: 1.4,
    drift: 0.04,
  },
  {
    symbol: 'SAMP',
    name: 'Sampath Bank PLC',
    sector: 'Banking',
    basePrice: 91.75,
    fundamentals: { pe: 4.8, pb: 0.7, roe: 17.5, dividendYield: 8.1, epsGrowth: 13.6 },
    volatility: 1.5,
    drift: 0.05,
  },
  {
    symbol: 'LOLC',
    name: 'LOLC Holdings PLC',
    sector: 'Financial Services',
    basePrice: 458.0,
    fundamentals: { pe: 9.7, pb: 1.6, roe: 18.9, dividendYield: 2.4, epsGrowth: -3.2 },
    volatility: 2.1,
    drift: -0.02,
  },
]

function generateCandles(seed: StockSeed, days: number): Candle[] {
  const rng = mulberry32(seedFromString(seed.symbol))
  const candles: Candle[] = []
  let close = seed.basePrice * (1 - (seed.drift / 100) * days)

  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const day = date.getDay()
    if (day === 0 || day === 6) continue // skip weekends, CSE trades Mon-Fri

    const swing = (rng() - 0.5) * 2 * seed.volatility
    const open = close
    const trend = seed.drift + swing
    close = Math.max(1, open * (1 + trend / 100))

    const high = Math.max(open, close) * (1 + rng() * (seed.volatility / 200))
    const low = Math.min(open, close) * (1 - rng() * (seed.volatility / 200))
    const volume = Math.round(50_000 + rng() * 400_000)

    candles.push({
      time: date.toISOString().slice(0, 10),
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
      volume,
    })
  }

  return candles
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function buildStocks(): Stock[] {
  return STOCK_SEEDS.map((seed) => {
    const candles = generateCandles(seed, 120)
    const last = candles[candles.length - 1]
    const prev = candles[candles.length - 2]
    const price = last?.close ?? seed.basePrice
    const change = prev ? round2(price - prev.close) : 0
    const changePercent = prev ? round2((change / prev.close) * 100) : 0

    return {
      symbol: seed.symbol,
      name: seed.name,
      sector: seed.sector,
      price,
      change,
      changePercent,
      fundamentals: seed.fundamentals,
      candles,
    }
  })
}
