import { useState } from 'react'
import { Copy, Check, Braces, Minimize2, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea } from '@/components/ui'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="JSON Formatter"
        description="Beautify, minify, and validate JSON data with syntax checking"
        category="developer"
        icon={Braces}
        serial="json-formatter"
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel hint={`${input.length} chars`}>Input JSON</SectionLabel>
        <Textarea
          mono
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={10}
          style={{ minHeight: 160 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Zap} onClick={beautify} disabled={!input}>
            Beautify
          </Button>
          <Button variant="secondary" icon={Minimize2} onClick={minify} disabled={!input}>
            Minify
          </Button>
          <Button variant="secondary" onClick={validate} disabled={!input}>
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
            <SectionLabel
              hint={`${validation?.valid ? 'valid' : 'invalid'} · ${output.split('\n').length} lines · ${output.length} chars`}
            >
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
            rows={10}
            style={{ minHeight: 160, backgroundColor: colors.bgDeep }}
          />
        </Card>
      )}
    </div>
  )
}
