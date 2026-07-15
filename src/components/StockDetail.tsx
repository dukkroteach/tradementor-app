import type { Stock } from '../types/stock'
import { computeSignal } from '../utils/signal'
import { CandlestickChart } from './CandlestickChart'
import { DataSourceBadge } from './DataSourceBadge'
import { SignalBadge } from './SignalBadge'

export function StockDetail({ stock }: { stock: Stock }) {
  const { signal, score, reasons } = computeSignal(stock.fundamentals, stock.candles)
  const isUp = stock.change >= 0

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-xl font-semibold text-muted-100">{stock.symbol}</h2>
            <SignalBadge signal={signal} score={score} />
            <DataSourceBadge source={stock.dataSource} />
          </div>
          <p className="text-sm text-muted-300">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl text-muted-100">Rs {stock.price.toFixed(2)}</div>
          <div className={`text-sm font-mono ${isUp ? 'text-signal-buy' : 'text-signal-sell'}`}>
            {isUp ? '+' : ''}
            {stock.change.toFixed(2)} ({isUp ? '+' : ''}
            {stock.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="mt-5">
        <CandlestickChart candles={stock.candles} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Metric label="P/E" value={`${stock.fundamentals.pe.toFixed(1)}x`} />
        <Metric label="P/B" value={`${stock.fundamentals.pb.toFixed(2)}x`} />
        <Metric label="ROE" value={`${stock.fundamentals.roe.toFixed(1)}%`} />
        <Metric label="Div. Yield" value={`${stock.fundamentals.dividendYield.toFixed(1)}%`} />
        <Metric label="EPS Growth" value={`${stock.fundamentals.epsGrowth >= 0 ? '+' : ''}${stock.fundamentals.epsGrowth.toFixed(1)}%`} />
      </div>
      <p className="mt-2 text-[10px] text-muted-400">
        Fundamentals are illustrative — no free real-time source publishes per-stock P/E, P/B, or ROE for CSE.
      </p>

      <div className="mt-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-400">Signal rationale</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-200">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-400" />
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-surface-700 bg-surface-800 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-400">{label}</div>
      <div className="font-mono text-sm text-muted-100">{value}</div>
    </div>
  )
}
