import type { Stock } from '../types/stock'
import { computeSignal } from '../utils/signal'
import { DataSourceBadge } from './DataSourceBadge'
import { SignalBadge } from './SignalBadge'

export function StockCard({ stock, onSelect, selected }: { stock: Stock; onSelect: () => void; selected: boolean }) {
  const { signal, score } = computeSignal(stock.fundamentals, stock.candles)
  const isUp = stock.change >= 0

  return (
    <button
      onClick={onSelect}
      className={`panel w-full text-left p-4 transition-colors hover:border-surface-500 focus:outline-none focus:ring-1 focus:ring-accent-teal/60 ${
        selected ? 'border-accent-teal/50 ring-1 ring-accent-teal/30' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-muted-100">{stock.symbol}</span>
            <span className="text-xs text-muted-300">{stock.sector}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-400 truncate max-w-[14rem]">{stock.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SignalBadge signal={signal} score={score} />
          <DataSourceBadge source={stock.dataSource} />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="font-mono text-lg text-muted-100">Rs {stock.price.toFixed(2)}</div>
          <div className={`text-xs font-mono ${isUp ? 'text-signal-buy' : 'text-signal-sell'}`}>
            {isUp ? '+' : ''}
            {stock.change.toFixed(2)} ({isUp ? '+' : ''}
            {stock.changePercent.toFixed(2)}%)
          </div>
        </div>
        <div className="text-right text-xs text-muted-400 space-y-0.5">
          <div>
            P/E <span className="font-mono text-muted-200">{stock.fundamentals.pe.toFixed(1)}</span>
          </div>
          <div>
            P/B <span className="font-mono text-muted-200">{stock.fundamentals.pb.toFixed(2)}</span>
          </div>
          <div>
            ROE <span className="font-mono text-muted-200">{stock.fundamentals.roe.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </button>
  )
}
