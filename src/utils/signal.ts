import type { Candle, Fundamentals, Signal } from '../types/stock'

export interface SignalResult {
  signal: Signal
  score: number // 0-100, higher = more bullish
  reasons: string[]
}

function scoreRange(value: number, thresholds: [number, number, number], points: [number, number, number, number]): number {
  const [t1, t2, t3] = thresholds
  if (value <= t1) return points[0]
  if (value <= t2) return points[1]
  if (value <= t3) return points[2]
  return points[3]
}

function momentum(candles: Candle[], lookback = 20): number {
  if (candles.length < lookback + 1) return 0
  const recent = candles[candles.length - 1]
  const past = candles[candles.length - 1 - lookback]
  if (!recent || !past || past.close === 0) return 0
  return ((recent.close - past.close) / past.close) * 100
}

export function computeSignal(fundamentals: Fundamentals, candles: Candle[]): SignalResult {
  const reasons: string[] = []
  let points = 0
  const maxPoints = 9 // 2 (PE) + 2 (PB) + 2 (ROE) + 1 (EPS growth) + 1 (dividend) + 1 (momentum)

  // Lower P/E is generally more attractive (value)
  const peScore = scoreRange(fundamentals.pe, [8, 15, 20], [2, 1, 0, -1])
  points += peScore
  reasons.push(peScore >= 1 ? `Attractive P/E of ${fundamentals.pe.toFixed(1)}x` : `Elevated P/E of ${fundamentals.pe.toFixed(1)}x`)

  // Lower P/B suggests trading closer to or below book value
  const pbScore = scoreRange(fundamentals.pb, [1, 1.5, 2.5], [2, 1, 0, -1])
  points += pbScore
  reasons.push(pbScore >= 1 ? `Trading near/below book (P/B ${fundamentals.pb.toFixed(2)}x)` : `Rich P/B of ${fundamentals.pb.toFixed(2)}x`)

  // Higher ROE indicates efficient use of equity
  const roeScore = scoreRange(15 - fundamentals.roe, [-5, 0, 5], [2, 1, 0, -1])
  points += roeScore
  reasons.push(roeScore >= 1 ? `Strong ROE of ${fundamentals.roe.toFixed(1)}%` : `Weak ROE of ${fundamentals.roe.toFixed(1)}%`)

  // EPS growth
  const epsScore = fundamentals.epsGrowth > 5 ? 1 : fundamentals.epsGrowth < -5 ? -1 : 0
  points += epsScore
  reasons.push(epsScore > 0 ? `EPS growing ${fundamentals.epsGrowth.toFixed(1)}% YoY` : epsScore < 0 ? `EPS declining ${fundamentals.epsGrowth.toFixed(1)}% YoY` : 'EPS roughly flat YoY')

  // Dividend yield
  const divScore = fundamentals.dividendYield > 5 ? 1 : fundamentals.dividendYield < 2 ? 0 : 0.5
  points += divScore
  if (fundamentals.dividendYield > 5) reasons.push(`High dividend yield of ${fundamentals.dividendYield.toFixed(1)}%`)

  // Price momentum (20-session)
  const mom = momentum(candles)
  const momScore = mom > 5 ? 1 : mom < -5 ? -1 : 0
  points += momScore
  reasons.push(momScore > 0 ? `Positive 20-day momentum (${mom.toFixed(1)}%)` : momScore < 0 ? `Negative 20-day momentum (${mom.toFixed(1)}%)` : 'Flat recent momentum')

  const score = Math.round(((points + maxPoints) / (maxPoints * 2)) * 100)
  const clamped = Math.min(100, Math.max(0, score))

  let signal: Signal = 'hold'
  if (clamped >= 65) signal = 'buy'
  else if (clamped < 40) signal = 'sell'

  return { signal, score: clamped, reasons }
}
