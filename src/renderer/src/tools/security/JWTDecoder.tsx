import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
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
    <div className="space-y-6">
      <div>
        <label className="text-sm block mb-1" style={{ color: colors.textSecondary }}>
          JWT Token
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none font-mono"
          style={{
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.text
          }}
        />
      </div>

      <button
        onClick={decode}
        disabled={!token}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        style={{
          backgroundColor: colors.accent,
          color: colors.text
        }}
      >
        Decode
      </button>

      {parsed && (
        <div className="space-y-4">
          {parsed.error && (
            <div
              className="p-3 rounded-lg border text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#EF4444',
                color: '#EF4444'
              }}
            >
              {parsed.error}
            </div>
          )}

          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
                Header
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), 'header')}
                className="flex items-center gap-1 text-xs"
                style={{ color: colors.accent }}
              >
                {copied === 'header' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'header' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono text-xs whitespace-pre-wrap" style={{ color: colors.text }}>
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
                Payload
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), 'payload')}
                className="flex items-center gap-1 text-xs"
                style={{ color: colors.accent }}
              >
                {copied === 'payload' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'payload' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono text-xs whitespace-pre-wrap" style={{ color: colors.text }}>
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Claims
            </h3>
            <div className="space-y-1 text-xs">
              {parsed.payload.exp && (
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Expires:</span>
                  <span style={{ color: colors.text }}>
                    {formatDate(parsed.payload.exp)}
                  </span>
                </div>
              )}
              {parsed.payload.iat && (
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Issued:</span>
                  <span style={{ color: colors.text }}>
                    {formatDate(parsed.payload.iat)}
                  </span>
                </div>
              )}
              {parsed.payload.sub && (
                <div className="flex justify-between">
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
