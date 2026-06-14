import { useState } from 'react'
import { Copy, Check, Key, Zap } from 'lucide-react'
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
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Key size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>JWT Decoder</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Decode and inspect JSON Web Tokens to view headers, payloads, and claims.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, color: colors.textSecondary, marginBottom: 10 }}>
          JWT Token
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          style={{
            width: '100%',
            minHeight: 160,
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.input,
            color: colors.text,
            fontSize: 15,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.6
          }}
        />
      </div>

      <button
        onClick={decode}
        disabled={!token}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 28px',
          borderRadius: 10,
          border: 'none',
          backgroundColor: colors.accent,
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          cursor: token ? 'pointer' : 'not-allowed',
          opacity: token ? 1 : 0.5,
          marginBottom: 32
        }}
      >
        <Zap size={18} />
        Decode
      </button>

      {parsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parsed.error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: '#7F1D1D',
              border: '1px solid #B91C1C',
              color: '#FCA5A5',
              fontSize: 15
            }}>
              {parsed.error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: colors.textSecondary }}>Decoded Token</span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(parsed, null, 2), 'all')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {copied === 'all' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'all' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div style={{
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.input
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: colors.text }}>
                Header
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), 'header')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: copied === 'header' ? '#22C55E' : colors.textSecondary,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {copied === 'header' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'header' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              fontFamily: 'monospace',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
              color: colors.text,
              margin: 0,
              lineHeight: 1.6
            }}>
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          <div style={{
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.input
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: colors.text }}>
                Payload
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), 'payload')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: copied === 'payload' ? '#22C55E' : colors.textSecondary,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {copied === 'payload' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'payload' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              fontFamily: 'monospace',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
              color: colors.text,
              margin: 0,
              lineHeight: 1.6
            }}>
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>

          <div style={{
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.input
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, marginTop: 0, color: colors.text }}>
              Claims
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {parsed.payload.exp && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: colors.textSecondary }}>Expires:</span>
                  <span style={{ color: colors.text }}>
                    {formatDate(parsed.payload.exp)}
                  </span>
                </div>
              )}
              {parsed.payload.iat && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: colors.textSecondary }}>Issued:</span>
                  <span style={{ color: colors.text }}>
                    {formatDate(parsed.payload.iat)}
                  </span>
                </div>
              )}
              {parsed.payload.sub && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: colors.textSecondary }}>Subject:</span>
                  <span style={{ color: colors.text }}>{parsed.payload.sub}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 4, fontSize: 13, color: colors.textSecondary, display: 'flex', gap: 16 }}>
            <span>📊 Algorithm: {parsed.header.alg || 'N/A'}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Type: {parsed.header.typ || 'N/A'}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Signature: {parsed.signature.substring(0, 20)}...</span>
          </div>
        </div>
      )}
    </div>
  )
}
