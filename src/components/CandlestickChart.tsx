import { useEffect, useRef } from 'react'
import { CandlestickSeries, ColorType, createChart, type IChartApi } from 'lightweight-charts'
import type { Candle } from '../types/stock'

export function CandlestickChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b93a7',
        fontFamily: 'ui-monospace, monospace',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: '#212733' },
        horzLines: { color: '#212733' },
      },
      rightPriceScale: { borderColor: '#2b3241' },
      timeScale: { borderColor: '#2b3241' },
      crosshair: { mode: 0 },
      autoSize: true,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#4f9c74',
      downColor: '#b35450',
      borderUpColor: '#4f9c74',
      borderDownColor: '#b35450',
      wickUpColor: '#4f9c74',
      wickDownColor: '#b35450',
    })

    series.setData(
      candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    )

    chart.timeScale().fitContent()
    chartRef.current = chart

    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [candles])

  return <div ref={containerRef} className="h-80 w-full" />
}
