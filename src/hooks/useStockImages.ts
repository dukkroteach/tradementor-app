import { useCallback, useEffect, useState } from 'react'

export interface StockImage {
  dataUrl: string
  fileName: string
  uploadedAt: string
}

export type SetImageResult = { ok: true } | { ok: false; error: string }

// Separate from manual-overrides storage — an attached reference image has its own
// lifecycle and shouldn't be wiped out by "Reset to live/simulated" or "Clear all overrides".
const STORAGE_KEY = 'trademendor:stock-images:v1'

function readStorage(): Record<string, StockImage> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, StockImage>) : {}
  } catch {
    return {}
  }
}

function writeStorage(images: Record<string, StockImage>): SetImageResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: "Couldn't save the image — this browser's storage is full. Try a smaller image, or remove another attachment first.",
    }
  }
}

export function useStockImages() {
  const [images, setImages] = useState<Record<string, StockImage>>(() => readStorage())

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setImages(readStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setImage = useCallback(
    (symbol: string, image: StockImage): SetImageResult => {
      const next = { ...images, [symbol]: image }
      const result = writeStorage(next)
      if (result.ok) setImages(next)
      return result
    },
    [images],
  )

  const clearImage = useCallback((symbol: string) => {
    setImages((prev) => {
      if (!(symbol in prev)) return prev
      const next = { ...prev }
      delete next[symbol]
      writeStorage(next)
      return next
    })
  }, [])

  return { images, setImage, clearImage }
}
