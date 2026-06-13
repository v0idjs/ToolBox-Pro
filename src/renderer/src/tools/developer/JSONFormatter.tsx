import { useState } from 'react'
import { Copy, Check, Braces, Minimize2 } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

type ValidationState = {
  valid: boolean
  message: string
}

export function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [validation, setValidation] = useState<ValidationState | null>(null)
  const [copied, setCopied] = useState(false)
  const colors = useThemeColors()

  const beautify = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setValidation({ valid: true, message: 'Valid JSON' })
    } catch (e) {
      setValidation({
        valid: false,
        message: e instanceof Error ? e.message : 'Invalid JSON'
      })
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setValidation({ valid: true, message: 'Valid JSON' })
    } catch (e) {
      setValidation({
        valid: false,
        message: e instanceof Error ? e.message : 'Invalid JSON'
      })
    }
  }

  const validate = () => {
    try {
      JSON.parse(input)
      setValidation({ valid: true, message: 'Valid JSON' })
    } catch (e) {
      setValidation({
        valid: false,
        message: e instanceof Error ? e.message : 'Invalid JSON'
      })
    }
  }

  const copyToClipboard = async () => {
    const textToCopy = output || input
    if (!textToCopy) return
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
            color: colors.text
          }}
        >
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={10}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={beautify}
          disabled={!input}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: colors.accent,
            color: colors.text,
            fontSize: '14px',
            fontWeight: 500,
            cursor: input ? 'pointer' : 'not-allowed',
            opacity: input ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          <Braces size={16} />
          Beautify
        </button>
        <button
          onClick={minify}
          disabled={!input}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.card,
            color: colors.textSecondary,
            fontSize: '14px',
            fontWeight: 500,
            cursor: input ? 'pointer' : 'not-allowed',
            opacity: input ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          <Minimize2 size={16} />
          Minify
        </button>
        <button
          onClick={validate}
          disabled={!input}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.card,
            color: colors.textSecondary,
            fontSize: '14px',
            fontWeight: 500,
            cursor: input ? 'pointer' : 'not-allowed',
            opacity: input ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          Validate
        </button>
      </div>

      {validation && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: validation.valid ? '#064E3B' : '#7F1D1D',
            border: `1px solid ${validation.valid ? '#047857' : '#B91C1C'}`,
            color: validation.valid ? '#10B981' : '#FCA5A5',
            fontSize: '14px'
          }}
        >
          {validation.valid ? '✓' : '✗'} {validation.message}
        </div>
      )}

      {output && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: colors.text
              }}
            >
              Output
            </label>
            <button
              onClick={copyToClipboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
                color: copied ? '#10B981' : colors.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={10}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}
    </div>
  )
}
