import type { DataSource } from '../types/stock'

const CONFIG: Record<DataSource, { label: string; classes: string; dot: string }> = {
  live: { label: 'Live', classes: 'text-signal-buy', dot: 'bg-signal-buy' },
  simulated: { label: 'Simulated', classes: 'text-signal-hold', dot: 'bg-signal-hold' },
  manual: { label: 'Manual', classes: 'text-accent-teal', dot: 'bg-accent-teal' },
  loading: { label: 'Loading', classes: 'text-muted-400', dot: 'bg-muted-400' },
}

export function DataSourceBadge({ source }: { source: DataSource }) {
  const cfg = CONFIG[source]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${cfg.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${source === 'loading' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}
