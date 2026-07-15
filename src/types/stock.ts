export type Signal = 'buy' | 'hold' | 'sell'

export interface Candle {
  time: string // 'YYYY-MM-DD'
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Fundamentals {
  pe: number
  pb: number
  roe: number // percent
  dividendYield: number // percent
  epsGrowth: number // percent, YoY
}

export interface Stock {
  symbol: string
  name: string
  sector: string
  price: number
  change: number // absolute
  changePercent: number
  fundamentals: Fundamentals
  candles: Candle[]
}
