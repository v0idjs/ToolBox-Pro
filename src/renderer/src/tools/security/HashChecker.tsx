import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Search, Zap, Copy, Check } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

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

  const copyHash = async () => {
    if (!computedHash) return
    try {
      await navigator.clipboard.writeText(computedHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Search size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Hash Checker</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Verify text integrity by comparing computed hashes against expected values.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, color: colors.textSecondary, marginBottom: 10 }}>Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to verify..."
          style={{
            width: '100%',
            minHeight: 160,
            padding: 16,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
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

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, color: colors.textSecondary, marginBottom: 10 }}>Expected Hash</label>
        <input
          type="text"
          value={expectedHash}
          onChange={(e) => { setExpectedHash(e.target.value); setResult(null) }}
          placeholder="Paste the hash to verify against..."
          style={{
            width: '100%',
            padding: 16,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            color: colors.text,
            fontSize: 15,
            fontFamily: 'monospace',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {ALGORITHMS.map((algo) => (
          <button
            key={algo}
            onClick={() => setAlgorithm(algo)}
            style={{
              padding: '10px 20px',
              background: algorithm === algo ? colors.accent : 'transparent',
              color: algorithm === algo ? '#fff' : colors.text,
              border: `1px solid ${algorithm === algo ? colors.accent : colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: algorithm === algo ? 600 : 400
            }}
          >
            {algo}
          </button>
        ))}
      </div>

      <button
        onClick={checkHash}
        disabled={!input || !expectedHash}
        style={{
          padding: '14px 28px',
          background: (!input || !expectedHash) ? colors.border : colors.accent,
          color: (!input || !expectedHash) ? colors.textSecondary : '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: (!input || !expectedHash) ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 32
        }}
      >
        <Zap size={18} />
        Verify Hash
      </button>

      {result && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: colors.textSecondary }}>Verification Result</span>
            {computedHash && (
              <button
                onClick={copyHash}
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
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div
            style={{
              padding: 16,
              background: result === 'match' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${result === 'match' ? '#22C55E' : '#EF4444'}`,
              borderRadius: 10,
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
          <div style={{ marginTop: 12, fontSize: 13, color: colors.textSecondary, display: 'flex', gap: 16 }}>
            <span>📊 Status: {result === 'match' ? 'Match' : 'No Match'}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Algorithm: {algorithm}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Input Length: {input.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
