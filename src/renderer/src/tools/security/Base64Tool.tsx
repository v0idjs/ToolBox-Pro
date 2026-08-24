import { useState } from 'react'
import { Copy, Check, ArrowUpDown, Lock, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const colors = useThemeColors()

  const process = () => {
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
    } catch {
      setError('Invalid input for ' + mode + ' operation')
      setOutput('')
    }
  }

  const swap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
    setError('')
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <ToolHeader
        name="Base64 Encoder/Decoder"
        description="Encode and decode Base64 strings for data transmission and storage."
        category="security"
        icon={Lock}
        serial="base64"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="tb-panel" style={{ padding: 20 }}>
          <SectionLabel hint={`${input.length} chars`}>
            {mode === 'encode' ? 'Plain Text' : 'Base64'}
          </SectionLabel>
          <textarea
            className="tb-field tb-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            spellCheck={false}
            style={{ width: '100%', minHeight: 150, resize: 'vertical', fontSize: 13.5 }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {(['encode', 'decode'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '7px 18px',
                  background: mode === m ? colors.accent : 'transparent',
                  color: mode === m ? colors.onAccent : colors.textSecondary,
                  border: `1px solid ${mode === m ? colors.accent : colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  fontSize: 13,
                  fontWeight: mode === m ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease, color var(--tb-speed-fast) ease'
                }}
              >
                {m === 'encode' ? 'Encode' : 'Decode'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" size="lg" icon={Zap} onClick={process} disabled={!input}>
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </Button>
          <Button variant="secondary" size="lg" icon={ArrowUpDown} onClick={swap}>
            Swap
          </Button>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        {output && (
          <div className="tb-panel" style={{ padding: 20 }}>
            <SectionLabel hint={`${output.length} chars`}>
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </SectionLabel>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <Button
                variant="secondary"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={copyToClipboard}
                style={
                  copied
                    ? { color: colors.success, borderColor: colors.success }
                    : undefined
                }
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div
              className="tb-mono"
              style={{
                padding: 14,
                background: colors.bgDeep,
                border: `1px solid ${colors.border}`,
                borderRadius: 'var(--tb-radius-ctl)',
                fontSize: 13.5,
                wordBreak: 'break-all',
                color: colors.text,
                lineHeight: 1.6
              }}
            >
              {output}
            </div>
            <p
              className="tb-mono"
              style={{ marginTop: 12, fontSize: 11, letterSpacing: '0.04em', color: colors.textFaint }}
            >
              Mode: {mode === 'encode' ? 'Encoding' : 'Decoding'} · Input: {input.length} chars · Output: {output.length} chars
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
