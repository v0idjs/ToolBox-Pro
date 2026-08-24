import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Search, Zap, Copy, Check } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

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
    <div>
      <ToolHeader
        name="Hash Checker"
        description="Verify text integrity by comparing computed hashes against expected values."
        category="security"
        icon={Search}
        serial="hash-checker"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="tb-panel" style={{ padding: 20 }}>
          <SectionLabel hint={`${input.length} chars`}>Input Text</SectionLabel>
          <textarea
            className="tb-field tb-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to verify..."
            spellCheck={false}
            style={{ width: '100%', minHeight: 140, resize: 'vertical', fontSize: 13.5 }}
          />
        </div>

        <div className="tb-panel" style={{ padding: 20 }}>
          <SectionLabel>Expected Hash</SectionLabel>
          <input
            type="text"
            className="tb-field tb-mono"
            value={expectedHash}
            onChange={(e) => { setExpectedHash(e.target.value); setResult(null) }}
            placeholder="Paste the hash to verify against..."
            spellCheck={false}
            style={{ width: '100%', fontSize: 14 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            {ALGORITHMS.map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className="tb-mono"
                style={{
                  padding: '7px 16px',
                  background: algorithm === algo ? colors.accent : 'transparent',
                  color: algorithm === algo ? colors.onAccent : colors.textSecondary,
                  border: `1px solid ${algorithm === algo ? colors.accent : colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  fontSize: 12.5,
                  fontWeight: algorithm === algo ? 600 : 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease, color var(--tb-speed-fast) ease'
                }}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Zap}
          onClick={checkHash}
          disabled={!input || !expectedHash}
        >
          Verify Hash
        </Button>

        {result && (
          <div className="tb-panel" style={{ padding: 20 }}>
            <SectionLabel
              hint={
                computedHash ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={copied ? Check : Copy}
                    onClick={copyHash}
                    style={
                      copied
                        ? { color: colors.success, borderColor: colors.success }
                        : undefined
                    }
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                ) : undefined
              }
            >
              Verification Result
            </SectionLabel>
            <div
              style={{
                background: result === 'match' ? `${colors.success}15` : `${colors.error}15`,
                border: `1px solid ${result === 'match' ? colors.success : colors.error}40`,
                borderRadius: 'var(--tb-radius-ctl)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              {result === 'match' ? (
                <CheckCircle size={22} color={colors.success} style={{ flexShrink: 0 }} />
              ) : (
                <XCircle size={22} color={colors.error} style={{ flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: result === 'match' ? colors.success : colors.error,
                    fontSize: 15
                  }}
                >
                  {result === 'match' ? 'Hash Matched!' : 'Hash Does Not Match'}
                </div>
                {computedHash && (
                  <div
                    className="tb-mono"
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: 4,
                      wordBreak: 'break-all'
                    }}
                  >
                    Computed: {computedHash}
                  </div>
                )}
              </div>
            </div>
            <p
              className="tb-mono"
              style={{ marginTop: 12, fontSize: 11, letterSpacing: '0.04em', color: colors.textFaint }}
            >
              Status: {result === 'match' ? 'Match' : 'No Match'} · Algorithm: {algorithm} · Input length: {input.length}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
