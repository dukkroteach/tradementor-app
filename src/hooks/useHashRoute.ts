import { useEffect, useState } from 'react'

/** Minimal hash-based routing so #admin is bookmarkable without adding a router dependency. */
export function useHashRoute(): [string, (hash: string) => void] {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, ''))

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash.replace(/^#/, ''))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(next: string) {
    window.location.hash = next
  }

  return [hash, navigate]
}
