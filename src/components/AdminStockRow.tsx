import { useState } from 'react'
import type { OverrideFields } from '../hooks/useManualOverrides'
import type { SetImageResult, StockImage } from '../hooks/useStockImages'
import type { Stock } from '../types/stock'
import { resizeImageFile } from '../utils/image'

interface FormValues {
  price: number
  change: number
  changePercent: number
  pe: number
  pb: number
  roe: number
  dividendYield: number
  epsGrowth: number
}

function toFormValues(stock: Stock): FormValues {
  return {
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    pe: stock.fundamentals.pe,
    pb: stock.fundamentals.pb,
    roe: stock.fundamentals.roe,
    dividendYield: stock.fundamentals.dividendYield,
    epsGrowth: stock.fundamentals.epsGrowth,
  }
}

export function AdminStockRow({
  stock,
  hasOverride,
  onSave,
  onClear,
  image,
  onSetImage,
  onClearImage,
}: {
  stock: Stock
  hasOverride: boolean
  onSave: (fields: OverrideFields) => void
  onClear: () => void
  image: StockImage | undefined
  onSetImage: (image: StockImage) => SetImageResult
  onClearImage: () => void
}) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(stock))
  const [saved, setSaved] = useState(false)

  function update(key: keyof FormValues, raw: string) {
    const parsed = parseFloat(raw)
    setSaved(false)
    setValues((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : prev[key] }))
  }

  function handleSave() {
    onSave(values)
    setSaved(true)
  }

  function handleClear() {
    setValues(toFormValues(stock))
    setSaved(false)
    onClear()
  }

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-sm font-semibold text-muted-100">{stock.symbol}</span>
          <span className="ml-2 text-xs text-muted-400">{stock.name}</span>
        </div>
        {hasOverride && (
          <button onClick={handleClear} className="shrink-0 text-xs text-muted-400 hover:text-signal-sell">
            Reset to live/simulated
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Price (Rs)" value={values.price} onChange={(v) => update('price', v)} />
        <Field label="Change" value={values.change} onChange={(v) => update('change', v)} />
        <Field label="Change %" value={values.changePercent} onChange={(v) => update('changePercent', v)} />
        <Field label="P/E" value={values.pe} onChange={(v) => update('pe', v)} />
        <Field label="P/B" value={values.pb} onChange={(v) => update('pb', v)} />
        <Field label="ROE %" value={values.roe} onChange={(v) => update('roe', v)} />
        <Field label="Div Yield %" value={values.dividendYield} onChange={(v) => update('dividendYield', v)} />
        <Field label="EPS Growth %" value={values.epsGrowth} onChange={(v) => update('epsGrowth', v)} />
      </div>

      <div className="mt-3 flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-signal-buy">Saved</span>}
        <button
          onClick={handleSave}
          className="rounded-md border border-accent-teal/40 bg-accent-teal/15 px-3 py-1.5 text-xs font-medium text-accent-teal hover:bg-accent-teal/25"
        >
          Save
        </button>
      </div>

      <ReferenceImageField image={image} onSetImage={onSetImage} onClearImage={onClearImage} />
    </div>
  )
}

function ReferenceImageField({
  image,
  onSetImage,
  onClearImage,
}: {
  image: StockImage | undefined
  onSetImage: (image: StockImage) => SetImageResult
  onClearImage: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const dataUrl = await resizeImageFile(file)
      const result = onSetImage({ dataUrl, fileName: file.name, uploadedAt: new Date().toISOString() })
      if (!result.ok) setError(result.error)
    } catch {
      setError('Could not process that image.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 border-t border-surface-700 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-muted-400">Reference image</span>
        {image && (
          <button onClick={onClearImage} className="text-xs text-muted-400 hover:text-signal-sell">
            Remove
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3">
        {image && (
          <img src={image.dataUrl} alt={image.fileName} className="h-14 w-auto rounded-md border border-surface-700 object-cover" />
        )}
        <label className="cursor-pointer rounded-md border border-surface-700 bg-surface-800 px-2.5 py-1.5 text-xs font-medium text-muted-300 hover:border-surface-500 hover:text-muted-100">
          {busy ? 'Processing...' : image ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={busy} />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-signal-sell">{error}</p>}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (raw: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-400">{label}</span>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-surface-700 bg-surface-800 px-2 py-1.5 font-mono text-sm text-muted-100 focus:border-accent-teal/60 focus:outline-none"
      />
    </label>
  )
}
