import { useEffect, useRef, useState } from 'react'
import type { Stock } from '../types/stock'
import { answerQuery } from '../utils/chatbot'

interface Message {
  role: 'user' | 'bot'
  text: string
}

function introMessage(stocks: Stock[]): Message {
  const symbols = stocks.map((s) => s.symbol).join(', ')
  return {
    role: 'bot',
    text: `Hi! Ask me about ${symbols} — price, P/E, P/B, ROE, dividend yield, EPS growth, or buy/hold/sell signals. This is a rule-based assistant answering only from the data currently loaded in the app, not a general AI.`,
  }
}

export function Chatbot({ stocks }: { stocks: Stock[] }) {
  const [messages, setMessages] = useState<Message[]>(() => [introMessage(stocks)])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    const answer = answerQuery(trimmed, stocks)
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'bot', text: answer }])
    setInput('')
  }

  return (
    <div className="panel flex h-[32rem] flex-col p-4">
      <h2 className="mb-3 text-sm font-medium text-muted-100">Stock Assistant</h2>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-accent-teal/20 text-muted-100' : 'bg-surface-800 text-muted-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a stock..."
          className="flex-1 rounded-md border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-muted-100 focus:border-accent-teal/60 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-accent-teal/40 bg-accent-teal/15 px-3 py-2 text-sm font-medium text-accent-teal hover:bg-accent-teal/25"
        >
          Send
        </button>
      </form>
    </div>
  )
}
