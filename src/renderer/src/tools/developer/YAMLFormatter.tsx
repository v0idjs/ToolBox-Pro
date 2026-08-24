import { useState } from 'react'
import { Copy, Check, FileCode2, Minimize2, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea } from '@/components/ui'

export function YAMLFormatter() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [validation, setValidation] = useState<{ valid: boolean; message: string } | null>(null)
  const colors = useThemeColors()

  const validateYAML = (yaml: string): { valid: boolean; message: string } => {
    if (!yaml.trim()) return { valid: false, message: 'Input is empty' }

    if (yaml.includes('\t')) {
      const lines = yaml.split('\n')
      const tabLines = lines
        .map((line, i) => (line.includes('\t') ? i + 1 : -1))
        .filter((i) => i !== -1)
      return {
        valid: false,
        message: `Tab characters are not allowed in YAML (found on line${tabLines.length > 1 ? 's' : ''}: ${tabLines.join(', ')})`,
      }
    }

    const lines = yaml.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const indent = line.length - line.trimStart().length
      if (indent % 2 !== 0) {
        return {
          valid: false,
          message: `Inconsistent indentation on line ${i + 1} (expected multiple of 2 spaces, found ${indent})`,
        }
      }

      const trimmed = line.trim()
      if (trimmed.startsWith('- ') || trimmed.startsWith('-')) {
        if (trimmed === '-') {
          const nextLine = lines.slice(i + 1).find((l) => l.trim())
          if (nextLine && (nextLine.trim().startsWith('- ') || nextLine.trim() === '-')) {
            continue
          }
        }
      }

      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':')
        const beforeColon = trimmed.substring(0, colonIndex).trim()
        if (beforeColon.includes(':') || beforeColon.includes('{') || beforeColon.includes('}')) {
          return {
            valid: false,
            message: `Invalid key on line ${i + 1}: "${beforeColon}"`,
          }
        }
      }

      const bracketCount = (line.match(/[{}]/g) || []).length
      const bracketOpen = (line.match(/\{/g) || []).length
      const bracketClose = (line.match(/\}/g) || []).length
      if (bracketOpen !== bracketClose) {
        return {
          valid: false,
          message: `Unbalanced brackets on line ${i + 1}`,
        }
      }
    }

    const openBrackets = (yaml.match(/\{/g) || []).length
    const closeBrackets = (yaml.match(/\}/g) || []).length
    if (openBrackets !== closeBrackets) {
      return { valid: false, message: 'Unbalanced curly braces in document' }
    }

    const openBracketsSquare = (yaml.match(/\[/g) || []).length
    const closeBracketsSquare = (yaml.match(/\]/g) || []).length
    if (openBracketsSquare !== closeBracketsSquare) {
      return { valid: false, message: 'Unbalanced square brackets in document' }
    }

    return { valid: true, message: 'YAML syntax looks valid' }
  }

  const beautify = () => {
    const lines = input.split('\n')
    const result: string[] = []
    let indent = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        result.push('')
        continue
      }

      const isListItem = trimmed.startsWith('- ')
      const isKeyValue = trimmed.includes(':') && !trimmed.startsWith('-')

      if (isListItem) {
        result.push('  '.repeat(indent) + trimmed)
      } else if (trimmed.endsWith(':')) {
        result.push('  '.repeat(indent) + trimmed)
        indent++
      } else if (isKeyValue) {
        result.push('  '.repeat(indent) + trimmed)
      } else {
        result.push('  '.repeat(indent) + trimmed)
        if (indent > 0 && !trimmed.startsWith('-')) {
          indent = Math.max(0, indent - 1)
        }
      }
    }

    setInput(result.join('\n'))
    setValidation(null)
  }

  const minify = () => {
    const result = input
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.trim())
      .join('\n')

    setInput(result)
    setValidation(null)
  }

  const handleValidate = () => {
    const result = validateYAML(input)
    setValidation(result)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="YAML Formatter"
        description="Beautify, minify, and validate YAML documents with syntax checking"
        category="developer"
        icon={FileCode2}
        serial="yaml-formatter"
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel hint={`${input.split('\n').length} lines · ${input.length} chars`}>
          Raw YAML Input
        </SectionLabel>
        <Textarea
          mono
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setValidation(null)
          }}
          placeholder="Paste your YAML here..."
          style={{ minHeight: 300 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Zap} onClick={beautify}>
            Beautify
          </Button>
          <Button variant="secondary" icon={Minimize2} onClick={minify}>
            Minify
          </Button>
          <Button variant="secondary" onClick={handleValidate}>
            Validate
          </Button>
          <Button
            variant="ghost"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            disabled={!input}
            style={copied ? { color: colors.success } : undefined}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Card>

      {validation && (
        <div
          role="status"
          style={{
            border: `1px solid ${validation.valid ? colors.success : colors.error}`,
            backgroundColor: validation.valid ? `${colors.success}15` : `${colors.error}15`,
            borderRadius: 'var(--tb-radius-ctl)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: validation.valid ? colors.success : colors.error,
              flexShrink: 0
            }}
          />
          <span
            style={{
              color: validation.valid ? colors.success : colors.error,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {validation.message}
          </span>
        </div>
      )}
    </div>
  )
}
