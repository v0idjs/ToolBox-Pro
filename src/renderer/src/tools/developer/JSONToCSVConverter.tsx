import { useState, useCallback } from 'react'
import { ArrowLeftRight, ArrowDownUp, Copy, Check, Upload } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea } from '@/components/ui'

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, fullKey))
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val)
    } else {
      result[fullKey] = val
    }
  }
  return result
}

function jsonToCsv(data: unknown): string {
  let rows: Record<string, unknown>[]
  if (Array.isArray(data)) {
    rows = data.map((item) =>
      typeof item === 'object' && item !== null
        ? flattenObject(item as Record<string, unknown>)
        : { value: item }
    )
  } else if (typeof data === 'object' && data !== null) {
    rows = [flattenObject(data as Record<string, unknown>)]
  } else {
    return String(data)
  }

  if (rows.length === 0) return ''

  const allKeys = new Set<string>()
  rows.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)))
  const headers = Array.from(allKeys)

  const csvEscape = (val: unknown): string => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))
  ]
  return lines.join('\n')
}

function csvToJson(csv: string): unknown[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) {
    if (lines.length === 1) {
      const headers = parseCsvLine(lines[0])
      return headers.map(() => {
        const obj: Record<string, string> = {}
        headers.forEach((h) => (obj[h] = ''))
        return obj
      })
    }
    return []
  }

  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => (obj[h] = values[i] || ''))
    return obj
  })
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

export function JSONToCSVConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const colors = useThemeColors()

  const handleConvert = useCallback(() => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }
    try {
      if (direction === 'json-to-csv') {
        const parsed = JSON.parse(input)
        const csv = jsonToCsv(parsed)
        setOutput(csv)
      } else {
        const parsed = csvToJson(input)
        setOutput(JSON.stringify(parsed, null, 2))
      }
    } catch {
      setError(direction === 'json-to-csv' ? 'Invalid JSON input' : 'Invalid CSV input')
    }
  }, [input, direction])

  const handleSwap = useCallback(() => {
    setDirection((d) => (d === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv'))
    setInput(output)
    setOutput('')
    setError('')
  }, [output])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }, [output])

  const handleFileUpload = useCallback(async () => {
    try {
      const result = await window.api.openFile()
      if (result) {
        setInput(result.content)
        setOutput('')
        setError('')
      }
    } catch {}
  }, [])

  const handleSave = useCallback(async () => {
    if (!output) return
    try {
      const ext = direction === 'json-to-csv' ? '.csv' : '.json'
      await window.api.saveFile(output, ext)
    } catch {}
  }, [output, direction])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      setOutput('')
      setError('')
    } catch {}
  }, [])

  const inputLabel = direction === 'json-to-csv' ? 'JSON Input' : 'CSV Input'
  const outputLabel = direction === 'json-to-csv' ? 'CSV Output' : 'JSON Output'

  const inputRows = input.split('\n').length
  const outputRows = output.split('\n').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="JSON ↔ CSV Converter"
        description="Flatten nested JSON to CSV with dot-notation keys, or parse CSV back to JSON"
        category="developer"
        icon={ArrowLeftRight}
        serial="json-csv-converter"
      />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button variant="secondary" icon={ArrowDownUp} onClick={handleSwap}>
          {direction === 'json-to-csv' ? 'JSON → CSV' : 'CSV → JSON'}
        </Button>
        <Button variant="primary" icon={ArrowLeftRight} onClick={handleConvert}>
          Convert
        </Button>
        <Button variant="secondary" icon={Upload} onClick={handleFileUpload}>
          Open File
        </Button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: `${colors.error}15`,
            border: `1px solid ${colors.error}40`,
            borderRadius: 'var(--tb-radius-ctl)',
            padding: '12px 16px',
            color: colors.error,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <SectionLabel>{inputLabel}</SectionLabel>
            <Button variant="ghost" size="sm" onClick={handlePaste}>
              Paste
            </Button>
          </div>
          <Textarea
            mono
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setOutput('')
              setError('')
            }}
            placeholder={
              direction === 'json-to-csv'
                ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
                : 'name,age\nAlice,30\nBob,25'
            }
            style={{ minHeight: 300 }}
          />
          <span
            style={{
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint
            }}
          >
            {inputRows} rows
          </span>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <SectionLabel>{outputLabel}</SectionLabel>
            {output && (
              <div style={{ display: 'flex', gap: 6 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopy}
                  style={copied ? { color: colors.success } : undefined}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </div>
          <Textarea
            mono
            value={output}
            readOnly
            placeholder={
              direction === 'json-to-csv'
                ? 'Converted CSV will appear here...'
                : 'Converted JSON will appear here...'
            }
            style={{ minHeight: 300, opacity: output ? 1 : 0.6 }}
          />
          <span
            style={{
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint
            }}
          >
            {outputRows} rows
          </span>
        </Card>
      </div>
    </div>
  )
}
