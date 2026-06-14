import { useState } from 'react'
import { Copy, Check, Key } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

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
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Key size={24} color={colors.accent} />
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>JWT Decoder</h1>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
          JWT Token
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          rows={4}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: 14,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <button
          onClick={decode}
          disabled={!token}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: colors.accent,
            color: colors.text,
            fontSize: 14,
            fontWeight: 500,
            cursor: token ? 'pointer' : 'not-allowed',
            opacity: token ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          Decode
        </button>
      </div>

      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parsed.error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: '#7F1D1D',
              border: '1px solid #B91C1C',
              color: '#FCA5A5',
              fontSize: 14
            }}>
              {parsed.error}
            </div>
          )}

          <div style={{
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.card
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: colors.text }}>
                Header
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), 'header')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.card,
                  color: copied === 'header' ? '#10B981' : colors.textSecondary,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                {copied === 'header' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'header' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{
              fontFamily: 'monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              color: colors.text,
              margin: 0
            }}>
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          <div style={{
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.card
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: colors.text }}>
                Payload
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), 'payload')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.card,
                  color: copied === 'payload' ? '#10B981' : colors.textSecondary,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                {copied === 'payload' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'payload' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{
              fontFamily: 'monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              color: colors.text,
              margin: 0
            }}>
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>

          <div style={{
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.card
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 0, color: colors.text }}>
              Claims
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {parsed.payload.exp && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: colors.textSecondary }}>Expires:</span>
                  <span style={{ color: colors.text }}>
                    {formatDate(parsed.payload.exp)}
                  </span>
                </div>
              )}
              {parsed.payload.iat && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: colors.textSecondary }}>Issued:</span>
                  <span style={{ color: colors.text }}>
                    {formatDate(parsed.payload.iat)}
                  </span>
                </div>
              )}
              {parsed.payload.sub && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: colors.textSecondary }}>Subject:</span>
                  <span style={{ color: colors.text }}>{parsed.payload.sub}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
