import { useState } from 'react'
import { useCseStocks } from './hooks/useCseStocks'
import { useHashRoute } from './hooks/useHashRoute'
import { useManualOverrides } from './hooks/useManualOverrides'
import { applyManualOverride } from './utils/applyManualOverride'
import { AdminPanel } from './components/AdminPanel'
import { StockCard } from './components/StockCard'
import { StockDetail } from './components/StockDetail'

function App() {
  const { stocks: baseStocks, lastRefreshedAt, refresh } = useCseStocks()
  const { overrides, setOverride, clearOverride, clearAll } = useManualOverrides()
  const [route, navigate] = useHashRoute()
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>(undefined)

  const stocks = baseStocks.map((stock) => applyManualOverride(stock, overrides[stock.symbol]))
  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) ?? stocks[0]
  const anyLive = stocks.some((s) => s.dataSource === 'live')
  const anySimulated = stocks.some((s) => s.dataSource === 'simulated')
  const isAdmin = route === 'admin'

  return (
    <div className="min-h-screen bg-surface-950">
      <header className="border-b border-surface-800 bg-surface-900/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-teal/15 text-accent-teal font-mono text-sm font-bold">
              TM
            </div>
            <div>
              <h1 className="text-base font-semibold text-muted-100">TradeMentor</h1>
              <p className="text-xs text-muted-400">Colombo Stock Exchange · Investment Tracker</p>
            </div>
          </div>
          <button
            onClick={() => navigate(isAdmin ? '' : 'admin')}
            className="shrink-0 rounded-md border border-surface-700 bg-surface-800 px-3 py-1.5 text-xs font-medium text-muted-200 hover:border-surface-500 hover:text-muted-100"
          >
            {isAdmin ? '← Back to dashboard' : 'Admin'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isAdmin ? (
          <AdminPanel stocks={stocks} overrides={overrides} onSave={setOverride} onClear={clearOverride} onClearAll={clearAll} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-400">
              <span>
                {anyLive && !anySimulated && 'Showing live CSE price and chart data.'}
                {anyLive && anySimulated && 'Showing live CSE data where available; some stocks fell back to simulated data.'}
                {!anyLive && anySimulated && 'Live CSE feed unavailable right now — showing simulated data.'}
                {!anyLive && !anySimulated && 'Connecting to CSE...'}
                {lastRefreshedAt && <span className="ml-2 text-muted-400/70">Updated {lastRefreshedAt.toLocaleTimeString()}</span>}
              </span>
              <button
                onClick={refresh}
                className="rounded-md border border-surface-700 bg-surface-800 px-2.5 py-1 font-medium text-muted-200 hover:border-surface-500 hover:text-muted-100"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[20rem_1fr]">
              <section aria-label="Watchlist" className="space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-400">Watchlist</h2>
                {stocks.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    selected={stock.symbol === selectedStock?.symbol}
                    onSelect={() => setSelectedSymbol(stock.symbol)}
                  />
                ))}
              </section>

              <section aria-label="Stock detail">{selectedStock && <StockDetail stock={selectedStock} />}</section>
            </div>

            <p className="mt-8 text-center text-xs text-muted-400">
              Prices and charts are sourced from CSE's public (unofficial) data feed when reachable, unless manually
              overridden in Admin. Fundamentals (P/E, P/B, ROE) are illustrative unless manually overridden.
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default App
