import type { Stock } from '../types/stock'
import { computeSignal } from './signal'

type MetricKey = 'price' | 'change' | 'pe' | 'pb' | 'roe' | 'dividendYield' | 'epsGrowth'

const METRIC_LABELS: Record<MetricKey, string> = {
  price: 'price',
  change: 'change',
  pe: 'P/E',
  pb: 'P/B',
  roe: 'ROE',
  dividendYield: 'dividend yield',
  epsGrowth: 'EPS growth',
}

const SYMBOL_ALIASES: Record<string, string[]> = {
  COMB: ['comb', 'commercial bank', 'combank'],
  JKH: ['jkh', 'john keells'],
  HNB: ['hnb', 'hatton national', 'hatton'],
  SAMP: ['samp', 'sampath'],
  LOLC: ['lolc'],
}

function findMentionedStocks(query: string, stocks: Stock[]): Stock[] {
  return stocks.filter((s) => SYMBOL_ALIASES[s.symbol]?.some((alias) => query.includes(alias)))
}

function detectMetrics(query: string): MetricKey[] {
  const found: MetricKey[] = []
  if (/\bp\/?e\b|price.to.earnings/.test(query)) found.push('pe')
  if (/\bp\/?b\b|price.to.book/.test(query)) found.push('pb')
  if (/\broe\b|return on equity/.test(query)) found.push('roe')
  if (/dividend|\byield\b/.test(query)) found.push('dividendYield')
  if (/\beps\b|earnings growth|earnings per share/.test(query)) found.push('epsGrowth')
  if (/\bprice\b|trading at|\bworth\b|\bcost\b/.test(query)) found.push('price')
  if (/\bchange\b|moved|performance/.test(query)) found.push('change')
  return found
}

function metricValue(stock: Stock, metric: MetricKey): string {
  const f = stock.fundamentals
  switch (metric) {
    case 'price':
      return `Rs ${stock.price.toFixed(2)}`
    case 'change':
      return `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`
    case 'pe':
      return `${f.pe.toFixed(1)}x`
    case 'pb':
      return `${f.pb.toFixed(2)}x`
    case 'roe':
      return `${f.roe.toFixed(1)}%`
    case 'dividendYield':
      return `${f.dividendYield.toFixed(1)}%`
    case 'epsGrowth':
      return `${f.epsGrowth >= 0 ? '+' : ''}${f.epsGrowth.toFixed(1)}%`
  }
}

function metricNumeric(stock: Stock, metric: MetricKey): number {
  const f = stock.fundamentals
  switch (metric) {
    case 'price':
      return stock.price
    case 'change':
      return stock.changePercent
    case 'pe':
      return f.pe
    case 'pb':
      return f.pb
    case 'roe':
      return f.roe
    case 'dividendYield':
      return f.dividendYield
    case 'epsGrowth':
      return f.epsGrowth
  }
}

function dataSourceLabel(stock: Stock): string {
  switch (stock.dataSource) {
    case 'live':
      return 'live CSE data'
    case 'manual':
      return 'manually entered data'
    case 'simulated':
      return 'simulated data'
    case 'loading':
      return 'still loading'
  }
}

function answerMetrics(stock: Stock, metrics: MetricKey[]): string {
  const lines = metrics.map((m) => `${METRIC_LABELS[m]}: ${metricValue(stock, m)}`)
  return `${stock.symbol} (${dataSourceLabel(stock)})\n${lines.join('\n')}`
}

function answerSignal(stock: Stock): string {
  const { signal, score, reasons } = computeSignal(stock.fundamentals, stock.candles)
  return `${stock.symbol} signal: ${signal.toUpperCase()} (score ${score}/100)\n${reasons.map((r) => `• ${r}`).join('\n')}`
}

function answerSummary(stock: Stock): string {
  const { signal } = computeSignal(stock.fundamentals, stock.candles)
  return [
    `${stock.symbol} — ${stock.name}`,
    `Price: Rs ${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`,
    `P/E ${stock.fundamentals.pe.toFixed(1)}x · P/B ${stock.fundamentals.pb.toFixed(2)}x · ROE ${stock.fundamentals.roe.toFixed(1)}%`,
    `Signal: ${signal.toUpperCase()} (${dataSourceLabel(stock)})`,
  ].join('\n')
}

function answerComparison(mentioned: Stock[], metrics: MetricKey[]): string {
  return mentioned.map((s) => `${s.symbol}: ${metrics.map((m) => `${METRIC_LABELS[m]} ${metricValue(s, m)}`).join(', ')}`).join('\n')
}

function answerSuperlative(query: string, metric: MetricKey, stocks: Stock[]): string {
  const isLowest = /\b(lowest|cheapest|bottom|worst)\b/.test(query)
  const sorted = [...stocks].sort((a, b) => (isLowest ? metricNumeric(a, metric) - metricNumeric(b, metric) : metricNumeric(b, metric) - metricNumeric(a, metric)))
  const winner = sorted[0]
  return `${winner.symbol} has the ${isLowest ? 'lowest' : 'highest'} ${METRIC_LABELS[metric]}: ${metricValue(winner, metric)}`
}

/** Pure rule-based query engine — no external API, answers only from the stocks passed in. */
export function answerQuery(query: string, stocks: Stock[]): string {
  const trimmed = query.trim()
  if (!trimmed) {
    return "Ask me about a stock's price, P/E, P/B, ROE, dividend yield, EPS growth, or buy/hold/sell signal."
  }

  const q = trimmed.toLowerCase()
  const symbolList = stocks.map((s) => s.symbol).join(', ')

  if (/^(hi|hello|hey|sup|yo)\b/.test(q)) {
    return `Hi! I can answer questions about ${symbolList}. Try "What's COMB's P/E?", "Should I buy JKH?", "Compare HNB and SAMP", or "Which stock has the highest ROE?"`
  }

  if (/\b(list|all stocks|watchlist|overview)\b/.test(q)) {
    return stocks
      .map((s) => `${s.symbol}: Rs ${s.price.toFixed(2)} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%) — ${computeSignal(s.fundamentals, s.candles).signal.toUpperCase()}`)
      .join('\n')
  }

  const mentioned = findMentionedStocks(q, stocks)
  const metrics = detectMetrics(q)
  const wantsSignal = /\b(buy|sell|hold|signal|recommend|should i|rating|verdict)\b/.test(q)
  const isSuperlative = /\b(highest|lowest|best|worst|cheapest|most expensive|top|bottom)\b/.test(q)

  if (isSuperlative && metrics.length > 0) {
    return answerSuperlative(q, metrics[0], stocks)
  }

  if (mentioned.length >= 2 && (/\b(compare|vs\.?|versus)\b/.test(q) || metrics.length > 0)) {
    return answerComparison(mentioned, metrics.length > 0 ? metrics : ['price', 'pe', 'pb', 'roe'])
  }

  if (mentioned.length === 1) {
    const stock = mentioned[0]
    if (wantsSignal) return answerSignal(stock)
    if (metrics.length > 0) return answerMetrics(stock, metrics)
    return answerSummary(stock)
  }

  if (wantsSignal) {
    return `Which stock? I can give a signal for ${symbolList}.`
  }

  return `I didn't catch that. Try asking about a specific stock (${symbolList}) — price, P/E, P/B, ROE, dividend yield, EPS growth, or whether to buy/hold/sell. I only know about these ${stocks.length} CSE stocks, not general market or financial advice.`
}
