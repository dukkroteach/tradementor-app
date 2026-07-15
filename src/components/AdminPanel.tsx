import type { OverrideFields } from '../hooks/useManualOverrides'
import type { ManualOverride, Stock } from '../types/stock'
import { AdminStockRow } from './AdminStockRow'

export function AdminPanel({
  stocks,
  overrides,
  onSave,
  onClear,
  onClearAll,
}: {
  stocks: Stock[]
  overrides: Record<string, ManualOverride>
  onSave: (symbol: string, fields: OverrideFields) => void
  onClear: (symbol: string) => void
  onClearAll: () => void
}) {
  const overrideCount = Object.keys(overrides).length

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-muted-100">Manual data overrides</h2>
            <p className="mt-1 text-xs text-muted-400">
              Saved values take priority over live and simulated data everywhere in the app, including the
              buy/hold/sell signal and chart. Stored only in this browser — not shared across devices or with other
              visitors.
            </p>
          </div>
          {overrideCount > 0 && (
            <button
              onClick={onClearAll}
              className="shrink-0 rounded-md border border-surface-700 bg-surface-800 px-2.5 py-1 text-xs font-medium text-muted-300 hover:border-signal-sell/50 hover:text-signal-sell"
            >
              Clear all overrides ({overrideCount})
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stocks.map((stock) => (
          <AdminStockRow
            key={stock.symbol}
            stock={stock}
            hasOverride={Boolean(overrides[stock.symbol])}
            onSave={(fields) => onSave(stock.symbol, fields)}
            onClear={() => onClear(stock.symbol)}
          />
        ))}
      </div>
    </div>
  )
}
