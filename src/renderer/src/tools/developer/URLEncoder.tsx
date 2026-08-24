import { useState } from 'react'
import { Copy, Check, Link2, ArrowDownUp, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea } from '@/components/ui'

export function URLEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const colors = useThemeColors()

  const handleEncode = () => {
    try {
      setError('')
      setOutput(encodeURIComponent(input))
    } catch (e: any) {
      setError(e.message || 'Failed to encode')
      setOutput('')
    }
  }

  const handleDecode = () => {
    try {
      setError('')
      setOutput(decodeURIComponent(input))
    } catch (e: any) {
      setError('Invalid URI: cannot decode')
      setOutput('')
    }
  }

  const handleEncodeAll = () => {
    try {
      setError('')
      setOutput(encodeURI(input))
    } catch (e: any) {
      setError(e.message || 'Failed to encode')
      setOutput('')
    }
  }

  const handleDecodeAll = () => {
    try {
      setError('')
      setOutput(decodeURI(input))
    } catch (e: any) {
      setError('Invalid URI: cannot decode')
      setOutput('')
    }
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="URL Encoder/Decoder"
        description="Encode and decode URLs and URI components with multiple modes"
        category="developer"
        icon={Link2}
        serial="url-encoder"
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel>Input</SectionLabel>
        <Textarea
          mono
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError('')
          }}
          placeholder="Enter text or URL to encode/decode..."
          style={{ minHeight: 160 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Zap} onClick={handleEncode}>
            Encode
          </Button>
          <Button variant="secondary" icon={ArrowDownUp} onClick={handleDecode}>
            Decode
          </Button>
          <Button variant="secondary" icon={ArrowDownUp} onClick={handleEncodeAll}>
            Encode All
          </Button>
          <Button variant="secondary" icon={ArrowDownUp} onClick={handleDecodeAll}>
            Decode All
          </Button>
        </div>
      </Card>

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: `${colors.error}15`,
            border: `1px solid ${colors.error}40`,
            borderRadius: 'var(--tb-radius-ctl)',
            padding: '12px 16px',
            color: colors.error,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          {error}
        </div>
      )}

      {output && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <SectionLabel
              hint={`${input.length} in · ${output.length} out · ${output.length > input.length ? '+' : ''}${output.length - input.length} diff`}
            >
              Output
            </SectionLabel>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopy}
              disabled={!output}
              title="Copy to clipboard"
              style={copied ? { color: colors.success } : undefined}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Textarea
            mono
            value={output}
            readOnly
            placeholder="Result will appear here..."
            style={{ minHeight: 160, backgroundColor: colors.bgDeep }}
          />
        </Card>
      )}
    </div>
  )
}
