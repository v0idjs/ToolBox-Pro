import { useState } from 'react'
import { Copy, Check, Code2, Minimize2, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea } from '@/components/ui'

export function XMLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [validation, setValidation] = useState<{ valid: boolean; message: string } | null>(null)
  const colors = useThemeColors()

  const beautify = () => {
    try {
      let result = input
      result = result.replace(/>\s*</g, '><')
      result = result.replace(/></g, '>\n<')
      let indent = 0
      const lines = result.split('\n')
      const beautified = lines.map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1)
        }
        const padded = '  '.repeat(indent) + trimmed
        if (
          trimmed.startsWith('<') &&
          !trimmed.startsWith('</') &&
          !trimmed.startsWith('<?') &&
          !trimmed.endsWith('/>') &&
          !/<[^/][^>]*\//.test(trimmed)
        ) {
          indent++
        }
        return padded
      })
      setOutput(beautified.filter((l) => l.trim()).join('\n'))
      setValidation(null)
    } catch {
      setValidation({ valid: false, message: 'Failed to beautify XML' })
    }
  }

  const minify = () => {
    try {
      const result = input.replace(/>\s+</g, '><').trim()
      setOutput(result)
      setValidation(null)
    } catch {
      setValidation({ valid: false, message: 'Failed to minify XML' })
    }
  }

  const validate = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'application/xml')
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        const msg = parseError.textContent || 'Invalid XML'
        setValidation({ valid: false, message: msg.substring(0, 200) })
      } else {
        setValidation({ valid: true, message: 'XML is well-formed' })
      }
    } catch {
      setValidation({ valid: false, message: 'Failed to parse XML' })
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output || input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setValidation({ valid: false, message: 'Failed to copy to clipboard' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="XML Formatter"
        description="Beautify, minify, and validate XML documents with syntax checking"
        category="developer"
        icon={Code2}
        serial="xml-formatter"
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel hint={`${input.length} chars`}>Raw XML Input</SectionLabel>
        <Textarea
          mono
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your XML here..."
          style={{ minHeight: 160 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Zap} onClick={beautify}>
            Beautify
          </Button>
          <Button variant="secondary" icon={Minimize2} onClick={minify}>
            Minify
          </Button>
          <Button variant="secondary" onClick={validate}>
            Validate
          </Button>
        </div>
      </Card>

      {validation && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--tb-radius-ctl)',
            backgroundColor: validation.valid ? `${colors.success}15` : `${colors.error}15`,
            border: `1px solid ${validation.valid ? colors.success : colors.error}`,
            color: validation.valid ? colors.success : colors.error,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          {validation.message}
        </div>
      )}

      {output && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <SectionLabel hint={`${output.split('\n').length} lines · ${output.length} chars`}>
              Output
            </SectionLabel>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={copyToClipboard}
              style={copied ? { color: colors.success } : undefined}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Textarea
            mono
            value={output}
            readOnly
            style={{ minHeight: 200, backgroundColor: colors.bgDeep }}
          />
        </Card>
      )}
    </div>
  )
}
