import type { Signal } from '../types/stock'

const CONFIG: Record<Signal, { label: string; icon: string; classes: string }> = {
  buy: {
    label: 'Buy',
    icon: '▲',
    classes: 'bg-signal-buy/15 text-signal-buy border-signal-buy/40',
  },
  hold: {
    label: 'Hold',
    icon: '●',
    classes: 'bg-signal-hold/15 text-signal-hold border-signal-hold/40',
  },
  sell: {
    label: 'Sell',
    icon: '▼',
    classes: 'bg-signal-sell/15 text-signal-sell border-signal-sell/40',
  },
}

export function SignalBadge({ signal, score }: { signal: Signal; score?: number }) {
  const cfg = CONFIG[signal]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.classes}`}
      title={score !== undefined ? `Signal score: ${score}/100` : undefined}
    >
      <span aria-hidden>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}
