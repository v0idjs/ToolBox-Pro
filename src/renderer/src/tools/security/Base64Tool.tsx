import { useState } from 'react'
import { Copy, Check, ArrowUpDown, Lock } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

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
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Lock size={24} color={colors.accent} />
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Base64 Encoder/Decoder</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setMode('encode')}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${mode === 'encode' ? colors.accent : colors.border}`,
            backgroundColor: mode === 'encode' ? colors.accent : colors.card,
            color: mode === 'encode' ? colors.text : colors.textSecondary,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${mode === 'decode' ? colors.accent : colors.border}`,
            backgroundColor: mode === 'decode' ? colors.accent : colors.card,
            color: mode === 'decode' ? colors.text : colors.textSecondary,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Decode
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
          {mode === 'encode' ? 'Plain Text' : 'Base64'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={process}
          disabled={!input}
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
            cursor: input ? 'pointer' : 'not-allowed',
            opacity: input ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button
          onClick={swap}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.card,
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ArrowUpDown size={14} />
          Swap
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          backgroundColor: '#7F1D1D',
          border: '1px solid #B91C1C',
          color: '#FCA5A5',
          fontSize: 14,
          marginBottom: 24
        }}>
          {error}
        </div>
      )}

      {output && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <button
              onClick={copyToClipboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
                color: copied ? '#10B981' : colors.textSecondary,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{
            padding: 16,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 14,
            wordBreak: 'break-all',
            color: colors.text,
            lineHeight: 1.6
          }}>
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
