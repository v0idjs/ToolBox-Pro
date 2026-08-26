import { useState } from 'react'
import { Copy, Check, Database, Minimize2, Zap } from 'lucide-react'
import { format } from 'sql-formatter'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea, Select } from '@/components/ui'

type Dialect =
  | 'sql'
  | 'postgresql'
  | 'mysql'
  | 'mariadb'
  | 'sqlite'
  | 'tsql'
  | 'plsql'
  | 'bigquery'
  | 'redshift'
  | 'spark'
  | 'trino'

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'tsql', label: 'SQL Server (T-SQL)' },
  { value: 'plsql', label: 'Oracle (PL/SQL)' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'redshift', label: 'Redshift' },
  { value: 'spark', label: 'Spark' },
  { value: 'trino', label: 'Trino' }
]

type KeywordCase = 'preserve' | 'upper' | 'lower'
type IndentStyle = 'spaces-2' | 'spaces-4' | 'tabs'

function minifySql(input: string): string {
  let out = ''
  let i = 0
  const n = input.length
  while (i < n) {
    const ch = input[i]
    const next = input[i + 1]
    if (ch === '-' && next === '-') {
      while (i < n && input[i] !== '\n') i++
      continue
    }
    if (ch === '/' && next === '*') {
      i += 2
      while (i < n && !(input[i] === '*' && input[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch
      out += ch
      i++
      while (i < n) {
        out += input[i]
        if (input[i] === quote) {
          i++
          break
        }
        i++
      }
      continue
    }
    if (/\s/.test(ch)) {
      if (out.length > 0 && out[out.length - 1] !== ' ') out += ' '
      while (i < n && /\s/.test(input[i])) i++
      continue
    }
    out += ch
    i++
  }
  return out.trim()
}

export function SqlFormatter() {
  const colors = useThemeColors()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dialect, setDialect] = useState<Dialect>('sql')
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('preserve')
  const [indentStyle, setIndentStyle] = useState<IndentStyle>('spaces-2')
  const [linesBetween, setLinesBetween] = useState(1)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const formatSql = (minified = false) => {
    if (!input.trim()) return
    if (minified) {
      try {
        setOutput(minifySql(input))
        setStatus({ kind: 'ok', text: 'Minified — comments removed, whitespace collapsed' })
      } catch (e) {
        setStatus({ kind: 'error', text: (e as Error).message })
      }
      return
    }
    try {
      const formatted = format(input, {
        language: dialect,
        keywordCase,
        tabWidth: indentStyle === 'spaces-4' ? 4 : 2,
        useTabs: indentStyle === 'tabs',
        linesBetweenQueries: linesBetween
      })
      setOutput(formatted)
      const statementCount = input.split(';').filter((s) => s.trim()).length
      setStatus({
        kind: 'ok',
        text:
          statementCount > 1
            ? `Formatted ${statementCount} statements (${DIALECTS.find((d) => d.value === dialect)?.label})`
            : `Formatted with ${DIALECTS.find((d) => d.value === dialect)?.label} rules`
      })
    } catch (e) {
      setStatus({
        kind: 'error',
        text: `Parse error: ${(e as Error).message.split('\n')[0]}`
      })
    }
  }

  const copyToClipboard = async () => {
    const text = output || input
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const outputLines = output ? output.split('\n').length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="SQL Formatter"
        description="Beautify and minify SQL queries with dialect-aware keyword casing"
        category="developer"
        icon={Database}
        serial="sql-formatter"
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel hint={`${input.length} chars`}>Input SQL</SectionLabel>
        <Textarea
          mono
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT a, b FROM t WHERE a > 1"
          rows={10}
          style={{ minHeight: 160 }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 10
          }}
        >
          <Select
            label="Dialect"
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
          <Select
            label="Keywords"
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
          >
            <option value="preserve">Preserve case</option>
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
          </Select>
          <Select
            label="Indent"
            value={indentStyle}
            onChange={(e) => setIndentStyle(e.target.value as IndentStyle)}
          >
            <option value="spaces-2">2 spaces</option>
            <option value="spaces-4">4 spaces</option>
            <option value="tabs">Tabs</option>
          </Select>
          <Select
            label="Lines between queries"
            value={linesBetween}
            onChange={(e) => setLinesBetween(Number(e.target.value))}
          >
            <option value={1}>1 line</option>
            <option value={2}>2 lines</option>
          </Select>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Zap} onClick={() => formatSql(false)} disabled={!input.trim()}>
            Format
          </Button>
          <Button variant="secondary" icon={Minimize2} onClick={() => formatSql(true)} disabled={!input.trim()}>
            Minify
          </Button>
        </div>
      </Card>

      {status && (
        <div
          role={status.kind === 'error' ? 'alert' : 'status'}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--tb-radius-ctl)',
            fontSize: 13,
            fontFamily: status.kind === 'error' ? 'var(--tb-font-mono)' : undefined,
            backgroundColor: status.kind === 'error' ? `${colors.error}15` : `${colors.success}15`,
            border: `1px solid ${status.kind === 'error' ? colors.error : colors.success}`,
            color: status.kind === 'error' ? colors.error : colors.success
          }}
        >
          {status.text}
        </div>
      )}

      {output && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel hint={`${output.length} chars · ${outputLines} lines`}>
            Formatted SQL
          </SectionLabel>
          <Textarea
            mono
            readOnly
            value={output}
            rows={12}
            style={{ minHeight: 180, backgroundColor: colors.bgDeep, color: colors.text }}
          />
          <div>
            <Button variant="secondary" icon={copied ? Check : Copy} onClick={copyToClipboard}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
