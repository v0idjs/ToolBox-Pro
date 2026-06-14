import { useState } from 'react'
import { Copy, Check, ArrowUpDown, Lock, Zap } from 'lucide-react'
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
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Lock size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Base64 Encoder/Decoder</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Encode and decode Base64 strings for data transmission and storage.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          onClick={() => setMode('encode')}
          style={{
            padding: '10px 20px',
            background: mode === 'encode' ? colors.accent : 'transparent',
            color: mode === 'encode' ? '#fff' : colors.text,
            border: `1px solid ${mode === 'encode' ? colors.accent : colors.border}`,
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: mode === 'encode' ? 600 : 400
          }}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          style={{
            padding: '10px 20px',
            background: mode === 'decode' ? colors.accent : 'transparent',
            color: mode === 'decode' ? '#fff' : colors.text,
            border: `1px solid ${mode === 'decode' ? colors.accent : colors.border}`,
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: mode === 'decode' ? 600 : 400
          }}
        >
          Decode
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, color: colors.textSecondary, marginBottom: 10 }}>
          {mode === 'encode' ? 'Plain Text' : 'Base64'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button
          onClick={process}
          disabled={!input}
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
            cursor: input ? 'pointer' : 'not-allowed',
            opacity: input ? 1 : 0.5
          }}
        >
          <Zap size={18} />
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button
          onClick={swap}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <ArrowUpDown size={16} />
          Swap
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          backgroundColor: '#7F1D1D',
          border: '1px solid #B91C1C',
          color: '#FCA5A5',
          fontSize: 15,
          marginBottom: 24
        }}>
          {error}
        </div>
      )}

      {output && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: colors.textSecondary }}>
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </span>
            <button
              onClick={copyToClipboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: copied ? '#22C55E' : colors.textSecondary,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div style={{
            padding: 16,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontFamily: 'monospace',
            fontSize: 14,
            wordBreak: 'break-all',
            color: colors.text,
            lineHeight: 1.6
          }}>
            {output}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: colors.textSecondary, display: 'flex', gap: 16 }}>
            <span>📊 Mode: {mode === 'encode' ? 'Encoding' : 'Decoding'}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Input: {input.length} chars</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Output: {output.length} chars</span>
          </div>
        </div>
      )}
    </div>
  )
}
