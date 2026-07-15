export type Signal = 'buy' | 'hold' | 'sell'

export type DataSource = 'loading' | 'live' | 'simulated' | 'manual'

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
  dataSource: DataSource
}

/** A partial, manually-entered set of fields that overrides live/simulated data for a stock. */
export interface ManualOverride {
  price?: number
  change?: number
  changePercent?: number
  pe?: number
  pb?: number
  roe?: number
  dividendYield?: number
  epsGrowth?: number
  updatedAt: string // ISO timestamp
}
