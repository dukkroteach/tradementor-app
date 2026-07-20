import { useState } from 'react'
import type { StockImage } from '../hooks/useStockImages'

export function StockImageViewer({ image }: { image: StockImage }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="block overflow-hidden rounded-md border border-surface-700 transition-colors hover:border-surface-500"
      >
        <img src={image.dataUrl} alt={image.fileName} className="h-28 w-auto object-cover" />
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setExpanded(false)}
        >
          <img
            src={image.dataUrl}
            alt={image.fileName}
            className="max-h-full max-w-full rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setExpanded(false)}
            className="absolute right-6 top-6 rounded-md border border-surface-600 bg-surface-800 px-3 py-1.5 text-sm text-muted-100 hover:border-surface-500"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}
