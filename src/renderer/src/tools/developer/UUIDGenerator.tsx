import { useState } from 'react'
import { Copy, Check, Hash, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Toggle } from '@/components/ui'

const QUANTITIES = [5, 10, 20, 50] as const

export function UUIDGenerator() {
  const colors = useThemeColors()
  const [currentUuid, setCurrentUuid] = useState('')
  const [uuidList, setUuidList] = useState<string[]>([])
  const [quantity, setQuantity] = useState<number | null>(null)
  const [uppercase, setUppercase] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const formatUuid = (uuid: string) => (uppercase ? uuid.toUpperCase() : uuid)

  const generateSingle = () => {
    setCurrentUuid(crypto.randomUUID())
    setUuidList([])
    setQuantity(null)
  }

  const generateMultiple = (count: number) => {
    const uuids = Array.from({ length: count }, () => crypto.randomUUID())
    setUuidList(uuids)
    setCurrentUuid('')
    setQuantity(count)
  }

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      if (index !== undefined) {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 1500)
      } else {
        setCopiedAll(true)
        setTimeout(() => setCopiedAll(false), 1500)
      }
    } catch {}
  }

  const copyAll = () => {
    const allUuids =
      uuidList.length > 0
        ? uuidList.map(formatUuid)
        : currentUuid
          ? [formatUuid(currentUuid)]
          : []
    if (allUuids.length > 0) {
      copyToClipboard(allUuids.join('\n'))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="UUID Generator"
        description="Generate v4 UUIDs in bulk with customizable format options"
        category="developer"
        icon={Hash}
        serial="uuid-generator"
      />

      <Card>
        <SectionLabel>Controls</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 13.5, color: colors.text }}>Uppercase</span>
          <Toggle checked={uppercase} onChange={setUppercase} label="Uppercase" />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Zap} onClick={generateSingle}>
            Generate UUID
          </Button>
          {QUANTITIES.map((q) => (
            <Button
              key={q}
              variant="secondary"
              onClick={() => generateMultiple(q)}
              style={
                quantity === q
                  ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
                  : undefined
              }
            >
              Generate {q}
            </Button>
          ))}
        </div>
      </Card>

      {currentUuid && (
        <Card>
          <SectionLabel>Generated UUID</SectionLabel>
          <div
            className="tb-mono"
            style={{
              padding: 14,
              backgroundColor: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-ctl)',
              fontSize: 14.5,
              lineHeight: 1.6,
              wordBreak: 'break-all',
              color: colors.text,
              marginBottom: 12
            }}
          >
            {formatUuid(currentUuid)}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={copiedAll ? Check : Copy}
            onClick={() => copyToClipboard(formatUuid(currentUuid))}
            style={copiedAll ? { color: colors.success, borderColor: colors.success } : undefined}
          >
            {copiedAll ? 'Copied!' : 'Copy'}
          </Button>
        </Card>
      )}

      {uuidList.length > 0 && (
        <Card>
          <SectionLabel hint={`${uuidList.length} items`}>Generated UUIDs</SectionLabel>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 400,
              overflowY: 'auto',
              marginBottom: 12
            }}
          >
            {uuidList.map((uuid, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: 12,
                  backgroundColor: colors.bgDeep,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)'
                }}
              >
                <span className="tb-mono" style={{ fontSize: 14, wordBreak: 'break-all', color: colors.text }}>
                  {formatUuid(uuid)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copiedIndex === index ? Check : Copy}
                  aria-label="Copy UUID"
                  onClick={() => copyToClipboard(formatUuid(uuid), index)}
                  style={copiedIndex === index ? { color: colors.success } : undefined}
                />
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            icon={copiedAll ? Check : Copy}
            onClick={copyAll}
            style={copiedAll ? { color: colors.success, borderColor: colors.success } : undefined}
          >
            {copiedAll ? 'All Copied!' : `Copy All (${uuidList.length})`}
          </Button>
          <p
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${colors.border}`,
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint
            }}
          >
            {uuidList.length} UUIDs generated · Format: v4 · {uppercase ? 'Uppercase' : 'Lowercase'}
          </p>
        </Card>
      )}
    </div>
  )
}
