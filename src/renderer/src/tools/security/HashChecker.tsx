import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Search } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-512'] as const
type Algorithm = typeof ALGORITHMS[number]

async function computeHash(algorithm: Algorithm, input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function HashChecker() {
  const colors = useThemeColors()
  const [input, setInput] = useState('')
  const [expectedHash, setExpectedHash] = useState('')
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256')
  const [result, setResult] = useState<'match' | 'no-match' | null>(null)
  const [computedHash, setComputedHash] = useState('')

  const checkHash = useCallback(async () => {
    if (!input || !expectedHash) return
    try {
      const computed = await computeHash(algorithm, input)
      setComputedHash(computed)
      setResult(computed === expectedHash.toLowerCase().trim() ? 'match' : 'no-match')
    } catch {
      setResult('no-match')
      setComputedHash('Error')
    }
  }, [input, expectedHash, algorithm])

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Search size={24} color={colors.accent} />
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Hash Checker</h1>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to verify..."
          style={{
            width: '100%',
            minHeight: 100,
            padding: 12,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.text,
            fontSize: 14,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Algorithm</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              style={{
                padding: '8px 16px',
                background: algorithm === algo ? colors.accent : colors.input,
                color: algorithm === algo ? '#fff' : colors.text,
                border: `1px solid ${algorithm === algo ? colors.accent : colors.border}`,
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: algorithm === algo ? 600 : 400
              }}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Expected Hash</label>
        <input
          type="text"
          value={expectedHash}
          onChange={(e) => { setExpectedHash(e.target.value); setResult(null) }}
          placeholder="Paste the hash to verify against..."
          style={{
            width: '100%',
            padding: 12,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.text,
            fontSize: 14,
            fontFamily: 'monospace',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={checkHash}
        disabled={!input || !expectedHash}
        style={{
          padding: '12px 24px',
          background: (!input || !expectedHash) ? colors.border : colors.accent,
          color: (!input || !expectedHash) ? colors.textSecondary : '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: (!input || !expectedHash) ? 'not-allowed' : 'pointer',
          marginBottom: 16
        }}
      >
        Verify Hash
      </button>

      {result && (
        <div
          style={{
            padding: 16,
            background: result === 'match' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result === 'match' ? '#22C55E' : '#EF4444'}`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          {result === 'match' ? (
            <CheckCircle size={24} color="#22C55E" />
          ) : (
            <XCircle size={24} color="#EF4444" />
          )}
          <div>
            <div style={{ fontWeight: 600, color: result === 'match' ? '#22C55E' : '#EF4444', fontSize: 15 }}>
              {result === 'match' ? 'Hash Matched!' : 'Hash Does Not Match'}
            </div>
            {computedHash && (
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                Computed: {computedHash}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
