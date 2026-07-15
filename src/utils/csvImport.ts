import type { OverrideFields } from '../hooks/useManualOverrides'

export interface CsvImportOutcome {
  overrides: Record<string, OverrideFields> // keyed by stock symbol
  warnings: string[]
  matchedSymbols: string[]
}

type Field = 'symbol' | keyof OverrideFields

const ALIASES: Record<Field, string[]> = {
  symbol: ['symbol', 'ticker', 'stock', 'code'],
  price: ['price', 'lastprice', 'ltp', 'last', 'currentprice', 'close', 'closingprice'],
  change: ['pricechange', 'absolutechange', 'changeabs'],
  changePercent: ['change', 'changepercent', 'pctchange', 'percentchange', 'changepct'],
  pe: ['pe', 'peratio'],
  pb: ['pb', 'pbratio'],
  roe: ['roe'],
  dividendYield: ['dividendyield', 'divyield', 'yield'],
  epsGrowth: ['epsgrowth', 'epsgr'],
}

const ALIAS_LOOKUP = new Map<string, Field>()
for (const [field, aliases] of Object.entries(ALIASES) as [Field, string[]][]) {
  for (const alias of aliases) ALIAS_LOOKUP.set(alias, field)
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, and CRLF/LF. */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  }

  return rows
}

/** Parses an uploaded CSV into manual-override fields, keyed by symbol, plus warnings for bad rows. */
export function parseStockCsv(text: string, knownSymbols: string[]): CsvImportOutcome {
  const rows = parseCsvRows(text)
  const warnings: string[] = []

  if (rows.length === 0) {
    return { overrides: {}, warnings: ['The file is empty.'], matchedSymbols: [] }
  }

  const headerRow = rows[0].map(normalizeHeader)
  const colField = headerRow.map((h) => ALIAS_LOOKUP.get(h))
  const symbolCol = colField.indexOf('symbol')

  if (symbolCol === -1) {
    return { overrides: {}, warnings: ['No "symbol" column found in the CSV header.'], matchedSymbols: [] }
  }

  const knownSet = new Set(knownSymbols.map((s) => s.toUpperCase()))
  const overrides: Record<string, OverrideFields> = {}
  const matchedSymbols: string[] = []

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const rawSymbol = (row[symbolCol] ?? '').trim().toUpperCase()
    if (!rawSymbol) continue

    if (!knownSet.has(rawSymbol)) {
      warnings.push(`Row ${r + 1}: unknown symbol "${rawSymbol}" — skipped.`)
      continue
    }

    const fields: OverrideFields = {}
    for (let c = 0; c < row.length; c++) {
      if (c === symbolCol) continue
      const field = colField[c]
      if (!field || field === 'symbol') continue

      const raw = (row[c] ?? '').trim()
      if (raw === '') continue

      const num = Number(raw)
      if (!Number.isFinite(num)) {
        warnings.push(`Row ${r + 1} (${rawSymbol}): invalid value "${raw}" for ${field} — left unchanged.`)
        continue
      }
      fields[field] = num
    }

    if (fields.price !== undefined && fields.change === undefined && fields.changePercent !== undefined) {
      const prevClose = fields.price / (1 + fields.changePercent / 100)
      fields.change = round2(fields.price - prevClose)
    }

    overrides[rawSymbol] = fields
    matchedSymbols.push(rawSymbol)
  }

  return { overrides, warnings, matchedSymbols }
}

/** Builds a downloadable CSV template pre-filled with the current value for each known stock. */
export function buildCsvTemplate(
  stocks: { symbol: string; price: number; changePercent: number; fundamentals: { pe: number; pb: number; roe: number; dividendYield: number; epsGrowth: number } }[],
): string {
  const header = 'symbol,price,change%,pe,pb,roe,dividendYield,epsGrowth'
  const lines = stocks.map(
    (s) => `${s.symbol},${s.price},${s.changePercent},${s.fundamentals.pe},${s.fundamentals.pb},${s.fundamentals.roe},${s.fundamentals.dividendYield},${s.fundamentals.epsGrowth}`,
  )
  return [header, ...lines].join('\n')
}
