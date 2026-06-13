import { useState } from 'react'
import { Copy, Check, ArrowUpDown } from 'lucide-react'
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
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('encode')}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
          style={{
            backgroundColor: mode === 'encode' ? colors.accent : colors.card,
            borderColor: mode === 'encode' ? colors.accent : colors.border,
            color: mode === 'encode' ? colors.text : colors.textSecondary
          }}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
          style={{
            backgroundColor: mode === 'decode' ? colors.accent : colors.card,
            borderColor: mode === 'decode' ? colors.accent : colors.border,
            color: mode === 'decode' ? colors.text : colors.textSecondary
          }}
        >
          Decode
        </button>
      </div>

      <div>
        <label className="text-sm block mb-1" style={{ color: colors.textSecondary }}>
          {mode === 'encode' ? 'Plain Text' : 'Base64'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none font-mono"
          style={{
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.text
          }}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={process}
          disabled={!input}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: colors.accent,
            color: colors.text
          }}
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button
          onClick={swap}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <ArrowUpDown size={14} />
          Swap
        </button>
      </div>

      {error && (
        <p className="text-sm" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: colors.accent }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div
            className="p-3 rounded-lg font-mono text-sm break-all"
            style={{ backgroundColor: colors.input, color: colors.text }}
          >
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
