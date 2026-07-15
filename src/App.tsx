import { useMemo, useState } from 'react'
import { buildStocks } from './data/cseStocks'
import { StockCard } from './components/StockCard'
import { StockDetail } from './components/StockDetail'

function App() {
  const stocks = useMemo(() => buildStocks(), [])
  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol)

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) ?? stocks[0]

  return (
    <div className="min-h-screen bg-surface-950">
      <header className="border-b border-surface-800 bg-surface-900/60">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-teal/15 text-accent-teal font-mono text-sm font-bold">
              TM
            </div>
            <div>
              <h1 className="text-base font-semibold text-muted-100">TradeMentor</h1>
              <p className="text-xs text-muted-400">Colombo Stock Exchange · Investment Tracker</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
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

          <section aria-label="Stock detail">
            {selectedStock && <StockDetail stock={selectedStock} />}
          </section>
        </div>

        <p className="mt-8 text-center text-xs text-muted-400">
          Data shown is simulated for demonstration purposes and is not sourced from live CSE feeds.
        </p>
      </main>
    </div>
  )
}

export default App
