import { useState, useEffect } from 'react'
import { Copy, Check, Clock, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

export function TimestampConverter() {
  const [currentSeconds, setCurrentSeconds] = useState(Math.floor(Date.now() / 1000))
  const [currentMilliseconds, setCurrentMilliseconds] = useState(Date.now())
  const [timestampInput, setTimestampInput] = useState('')
  const [convertedDate, setConvertedDate] = useState<string | null>(null)
  const [dateInput, setDateInput] = useState('')
  const [convertedTimestamp, setConvertedTimestamp] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const colors = useThemeColors()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSeconds(Math.floor(Date.now() / 1000))
      setCurrentMilliseconds(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const handleConvertTimestamp = () => {
    if (!timestampInput) return
    const value = Number(timestampInput)
    const timestamp = value > 1e12 ? value : value * 1000
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      setConvertedDate('Invalid timestamp')
      return
    }
    setConvertedDate(
      JSON.stringify(
        {
          iso8601: date.toISOString(),
          utc: date.toUTCString(),
          locale: date.toLocaleString(),
          relative: formatDate(date)
        },
        null,
        2
      )
    )
  }

  const handleConvertDate = () => {
    if (!dateInput) return
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
      setConvertedTimestamp('Invalid date')
      return
    }
    setConvertedTimestamp(
      JSON.stringify(
        {
          seconds: Math.floor(date.getTime() / 1000),
          milliseconds: date.getTime()
        },
        null,
        2
      )
    )
  }

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderCopyButton = (value: string, field: string) => (
    <Button
      variant="ghost"
      size="sm"
      icon={copiedField === field ? Check : Copy}
      onClick={() => copyToClipboard(value, field)}
      style={copiedField === field ? { color: colors.success } : undefined}
    >
      {copiedField === field ? 'Copied' : 'Copy'}
    </Button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Timestamp Converter"
        description="Convert between Unix timestamps and human-readable dates"
        category="developer"
        icon={Clock}
        serial="timestamp-converter"
      />

      <Card>
        <SectionLabel>Current timestamp</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Unix seconds', value: currentSeconds, field: 'currentSec' },
            { label: 'Unix milliseconds', value: currentMilliseconds, field: 'currentMs' }
          ].map((row) => (
            <div
              key={row.field}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.04em',
                    color: colors.textFaint,
                    marginBottom: 2
                  }}
                >
                  {row.label}
                </div>
                <span className="tb-mono" style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>
                  {row.value}
                </span>
              </div>
              {renderCopyButton(String(row.value), row.field)}
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${colors.border}`,
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            color: colors.textFaint
          }}
        >
          Live updating · Auto-refresh every 1s
        </p>
      </Card>

      <Card>
        <SectionLabel>Timestamp → date</SectionLabel>
        <Input
          type="number"
          placeholder="Enter Unix timestamp (auto-detects seconds vs milliseconds)"
          value={timestampInput}
          onChange={(e) => setTimestampInput(e.target.value)}
        />
        <Button variant="primary" icon={Zap} onClick={handleConvertTimestamp} style={{ marginTop: 12 }}>
          Convert
        </Button>
        {convertedDate && (
          <div
            style={{
              marginTop: 16,
              backgroundColor: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-panel)',
              padding: 16
            }}
          >
            <SectionLabel hint={renderCopyButton(convertedDate, 'tsToDate')}>Results</SectionLabel>
            <pre
              className="tb-mono"
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                fontSize: 13,
                lineHeight: 1.6,
                color: colors.text
              }}
            >
              {convertedDate}
            </pre>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel>Date → timestamp</SectionLabel>
        <Input
          type="text"
          placeholder="e.g. 2024-01-15 12:00:00"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <Button variant="primary" icon={Zap} onClick={handleConvertDate} style={{ marginTop: 12 }}>
          Convert
        </Button>
        {convertedTimestamp && (
          <div
            style={{
              marginTop: 16,
              backgroundColor: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-panel)',
              padding: 16
            }}
          >
            <SectionLabel hint={renderCopyButton(convertedTimestamp, 'dateToTs')}>Results</SectionLabel>
            <pre
              className="tb-mono"
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                fontSize: 13,
                lineHeight: 1.6,
                color: colors.text
              }}
            >
              {convertedTimestamp}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}
