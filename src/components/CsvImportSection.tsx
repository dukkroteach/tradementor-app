import { useRef, useState } from 'react'
import type { OverrideFields } from '../hooks/useManualOverrides'
import type { Stock } from '../types/stock'
import { buildCsvTemplate, parseStockCsv } from '../utils/csvImport'

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function CsvImportSection({
  stocks,
  onImportMany,
}: {
  stocks: Stock[]
  onImportMany: (entries: Record<string, OverrideFields>) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleDownloadTemplate() {
    const csv = buildCsvTemplate(stocks)
    downloadTextFile('trademendor-stock-data-template.csv', csv)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setFileName(file.name)
    const text = await file.text()
    const knownSymbols = stocks.map((s) => s.symbol)
    const result = parseStockCsv(text, knownSymbols)

    if (Object.keys(result.overrides).length > 0) {
      onImportMany(result.overrides)
    }
    setImportedCount(result.matchedSymbols.length)
    setWarnings(result.warnings)
  }

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-muted-100">Import from CSV</h2>
          <p className="mt-1 text-xs text-muted-400">
            Upload a CSV with columns <code className="font-mono">symbol, price, change%, pe, pb, roe,
            dividendYield, epsGrowth</code>. Matched rows are saved as manual overrides, same as editing a stock
            below.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="rounded-md border border-surface-700 bg-surface-800 px-2.5 py-1.5 text-xs font-medium text-muted-300 hover:border-surface-500 hover:text-muted-100"
          >
            Download template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-accent-teal/40 bg-accent-teal/15 px-2.5 py-1.5 text-xs font-medium text-accent-teal hover:bg-accent-teal/25"
          >
            Upload CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {fileName && importedCount !== null && (
        <div className="mt-3 rounded-md border border-surface-700 bg-surface-800 p-3 text-xs">
          <p className={importedCount > 0 ? 'text-signal-buy' : 'text-signal-sell'}>
            {fileName}: applied overrides for {importedCount} stock{importedCount === 1 ? '' : 's'}.
          </p>
          {warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-muted-400">
              {warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
