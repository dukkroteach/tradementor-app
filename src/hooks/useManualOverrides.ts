import { useCallback, useEffect, useState } from 'react'
import type { ManualOverride } from '../types/stock'

// Overrides live only in this browser's localStorage — there is no backend, so they
// are not shared across devices or visible to other visitors of the deployed site.
const STORAGE_KEY = 'trademendor:manual-overrides:v1'

export type OverrideFields = Omit<ManualOverride, 'updatedAt'>

function readStorage(): Record<string, ManualOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ManualOverride>) : {}
  } catch {
    return {}
  }
}

function writeStorage(overrides: Record<string, ManualOverride>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // localStorage may be unavailable (private browsing, quota) — overrides just won't persist.
  }
}

export function useManualOverrides() {
  const [overrides, setOverrides] = useState<Record<string, ManualOverride>>(() => readStorage())

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setOverrides(readStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setOverride = useCallback((symbol: string, fields: OverrideFields) => {
    setOverrides((prev) => {
      const next = { ...prev, [symbol]: { ...fields, updatedAt: new Date().toISOString() } }
      writeStorage(next)
      return next
    })
  }, [])

  const setManyOverrides = useCallback((entries: Record<string, OverrideFields>) => {
    setOverrides((prev) => {
      const now = new Date().toISOString()
      const next = { ...prev }
      for (const [symbol, fields] of Object.entries(entries)) {
        next[symbol] = { ...fields, updatedAt: now }
      }
      writeStorage(next)
      return next
    })
  }, [])

  const clearOverride = useCallback((symbol: string) => {
    setOverrides((prev) => {
      if (!(symbol in prev)) return prev
      const next = { ...prev }
      delete next[symbol]
      writeStorage(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setOverrides({})
    writeStorage({})
  }, [])

  return { overrides, setOverride, setManyOverrides, clearOverride, clearAll }
}
