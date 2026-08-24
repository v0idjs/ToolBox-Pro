import { useState, useMemo } from 'react'
import { Regex as RegexIcon, AlertCircle, Check, Copy } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input, Textarea } from '@/components/ui'

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [copied, setCopied] = useState(false)
  const colors = useThemeColors()

  const result = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, highlighted: testString }
    }

    try {
      const regex = new RegExp(pattern, flags)
      const matches: Array<{ index: number; text: string; groups: string[] }> = []
      let match: RegExpExecArray | null

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          })
          if (match[0].length === 0) regex.lastIndex++
        }
      } else {
        match = regex.exec(testString)
        if (match) {
          matches.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          })
        }
      }

      const highlighted = highlightMatches(testString, matches, `${colors.accent}33`)
      return { matches, error: null, highlighted }
    } catch (e) {
      return { matches: [], error: (e as Error).message, highlighted: testString }
    }
  }, [pattern, flags, testString, colors.accent])

  const copyToClipboard = async () => {
    if (!result.highlighted) return
    await navigator.clipboard.writeText(testString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Regex Tester"
        description="Test regular expressions with real-time matching and highlighting"
        category="developer"
        icon={RegexIcon}
        serial="regex-tester"
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
          <Input
            label="Pattern"
            className="tb-field tb-mono"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            spellCheck={false}
          />
          <Input
            label="Flags"
            className="tb-field tb-mono"
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m, s..."
            spellCheck={false}
          />
        </div>
        <SectionLabel hint={`${testString.length} chars`}>Test String</SectionLabel>
        <Textarea
          mono
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          rows={6}
          style={{ minHeight: 160 }}
        />
      </Card>

      {result.error && (
        <div
          role="alert"
          style={{
            border: `1px solid ${colors.error}40`,
            backgroundColor: `${colors.error}15`,
            borderRadius: 'var(--tb-radius-ctl)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <AlertCircle size={18} color={colors.error} style={{ flexShrink: 0 }} />
          <span style={{ color: colors.error, fontSize: 14, fontWeight: 500 }}>{result.error}</span>
        </div>
      )}

      {!result.error && pattern && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <SectionLabel
              hint={
                <span style={{ color: result.matches.length > 0 ? colors.success : colors.textFaint }}>
                  {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'} found ·
                  flags {flags || 'none'}
                </span>
              }
            >
              Result
            </SectionLabel>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={copyToClipboard}
              style={copied ? { color: colors.success } : undefined}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div
            className="tb-mono"
            style={{
              padding: 16,
              background: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-ctl)',
              fontSize: 13.5,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color: colors.text,
              wordBreak: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: result.highlighted }}
            role="region"
            aria-label="Highlighted regex matches"
          />

          {result.matches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionLabel>Matches</SectionLabel>
              {result.matches.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    background: colors.raised,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 'var(--tb-radius-ctl)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <span style={{ color: colors.accent }}>Match {i + 1}</span>
                    <span style={{ color: colors.textFaint }}>Index: {m.index}</span>
                  </div>
                  <div
                    className="tb-mono"
                    style={{
                      fontSize: 13.5,
                      color: colors.text,
                      marginBottom: m.groups.length > 0 ? 8 : 0,
                      wordBreak: 'break-all'
                    }}
                  >
                    "{m.text}"
                  </div>
                  {m.groups.length > 0 && (
                    <div className="tb-mono" style={{ fontSize: 12, color: colors.textSecondary }}>
                      Groups:{' '}
                      {m.groups.map((g, gi) => (
                        <span key={gi} style={{ color: gi % 2 === 0 ? colors.warning : colors.success, marginLeft: 4 }}>
                          ${gi + 1}: {g ?? 'undefined'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function highlightMatches(
  text: string,
  matches: Array<{ index: number; text: string }>,
  highlightBackground: string
): string {
  if (matches.length === 0) return escapeHtml(text)

  const parts: string[] = []
  let lastIndex = 0

  const sorted = [...matches].sort((a, b) => a.index - b.index)

  for (const match of sorted) {
    if (match.index < lastIndex) continue;
    parts.push(escapeHtml(text.slice(lastIndex, match.index)))
    parts.push(
      `<span style="background: ${highlightBackground}; border-radius: 2px;">${escapeHtml(match.text)}</span>`
    )
    lastIndex = match.index + match.text.length;
  }

  parts.push(escapeHtml(text.slice(lastIndex)))
  return parts.join('')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
