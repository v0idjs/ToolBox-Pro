import { useState } from 'react'
import { Copy, Check, Key, Zap, ShieldAlert } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

interface JWTHeader {
  alg?: string
  typ?: string
  [key: string]: unknown
}

interface JWTPayload {
  exp?: number
  iat?: number
  sub?: string
  [key: string]: unknown
}

interface ParsedJWT {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  valid: boolean
  error?: string
}

function parseJWT(token: string): ParsedJWT {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { header: {}, payload: {}, signature: '', valid: false, error: 'Invalid JWT format' }
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const signature = parts[2]

    return { header, payload, signature, valid: true }
  } catch {
    return { header: {}, payload: {}, signature: '', valid: false, error: 'Failed to decode JWT' }
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

export function JWTDecoder() {
  const [token, setToken] = useState('')
  const [parsed, setParsed] = useState<ParsedJWT | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const colors = useThemeColors()

  const decode = () => {
    setParsed(parseJWT(token))
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <ToolHeader
        name="JWT Decoder"
        description="Decode and inspect JSON Web Tokens to view headers, payloads, and claims."
        category="security"
        icon={Key}
        serial="jwt-decoder"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="tb-panel" style={{ padding: 20 }}>
          <SectionLabel hint={`${token.length} chars`}>JWT Token</SectionLabel>
          <textarea
            className="tb-field tb-mono"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            spellCheck={false}
            style={{ width: '100%', minHeight: 140, resize: 'vertical', fontSize: 13 }}
          />
        </div>

        <Button variant="primary" size="lg" icon={Zap} onClick={decode} disabled={!token}>
          Decode
        </Button>

        {parsed && (
          <>
            {parsed.error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: `${colors.error}15`,
                  border: `1px solid ${colors.error}40`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  color: colors.error,
                  fontSize: 14
                }}
              >
                {parsed.error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <SectionLabel>Decoded Token</SectionLabel>
              <Button
                variant="secondary"
                size="sm"
                icon={copied === 'all' ? Check : Copy}
                onClick={() => copyToClipboard(JSON.stringify(parsed, null, 2), 'all')}
                style={
                  copied === 'all'
                    ? { color: colors.success, borderColor: colors.success }
                    : undefined
                }
              >
                {copied === 'all' ? 'Copied' : 'Copy All'}
              </Button>
            </div>

            <div className="tb-panel" style={{ padding: 20 }}>
              <SectionLabel
                hint={
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={copied === 'header' ? Check : Copy}
                    onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), 'header')}
                    style={
                      copied === 'header'
                        ? { color: colors.success }
                        : undefined
                    }
                  >
                    {copied === 'header' ? 'Copied' : 'Copy'}
                  </Button>
                }
              >
                Header
              </SectionLabel>
              <pre
                className="tb-mono"
                style={{
                  margin: 0,
                  padding: 14,
                  background: colors.bgDeep,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: colors.text,
                  lineHeight: 1.6
                }}
              >
                {JSON.stringify(parsed.header, null, 2)}
              </pre>
            </div>

            <div className="tb-panel" style={{ padding: 20 }}>
              <SectionLabel
                hint={
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={copied === 'payload' ? Check : Copy}
                    onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), 'payload')}
                    style={
                      copied === 'payload'
                        ? { color: colors.success }
                        : undefined
                    }
                  >
                    {copied === 'payload' ? 'Copied' : 'Copy'}
                  </Button>
                }
              >
                Payload
              </SectionLabel>
              <pre
                className="tb-mono"
                style={{
                  margin: 0,
                  padding: 14,
                  background: colors.bgDeep,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: colors.text,
                  lineHeight: 1.6
                }}
              >
                {JSON.stringify(parsed.payload, null, 2)}
              </pre>
            </div>

            <div className="tb-panel" style={{ padding: 20 }}>
              <SectionLabel hint="Unverified">
                Signature
              </SectionLabel>
              <div
                className="tb-mono"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 14,
                  background: `${colors.warning}15`,
                  border: `1px solid ${colors.warning}40`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  fontSize: 12.5,
                  wordBreak: 'break-all',
                  color: colors.warning,
                  lineHeight: 1.6
                }}
              >
                <ShieldAlert size={15} style={{ flexShrink: 0 }} />
                <span>{parsed.signature || '—'}</span>
              </div>
            </div>

            {(parsed.payload.exp || parsed.payload.iat || parsed.payload.sub) && (
              <div className="tb-panel" style={{ padding: 20 }}>
                <SectionLabel>Claims</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parsed.payload.exp && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13.5 }}>
                      <span style={{ color: colors.textSecondary }}>Expires</span>
                      <span className="tb-mono" style={{ color: colors.text, fontVariantNumeric: 'tabular-nums' }}>
                        {formatDate(parsed.payload.exp)}
                      </span>
                    </div>
                  )}
                  {parsed.payload.iat && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13.5 }}>
                      <span style={{ color: colors.textSecondary }}>Issued</span>
                      <span className="tb-mono" style={{ color: colors.text, fontVariantNumeric: 'tabular-nums' }}>
                        {formatDate(parsed.payload.iat)}
                      </span>
                    </div>
                  )}
                  {parsed.payload.sub && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13.5 }}>
                      <span style={{ color: colors.textSecondary }}>Subject</span>
                      <span className="tb-mono" style={{ color: colors.text, wordBreak: 'break-all' }}>
                        {parsed.payload.sub}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p
              className="tb-mono"
              style={{ margin: 0, fontSize: 11, letterSpacing: '0.04em', color: colors.textFaint }}
            >
              Algorithm: {parsed.header.alg || 'N/A'} · Type: {parsed.header.typ || 'N/A'} · Signature unverified — do not trust without validation
            </p>
          </>
        )}
      </div>
    </div>
  )
}
