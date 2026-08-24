import { useState } from 'react'
import { Zap, Copy, Check, Download, FolderOpen, CopyX } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Textarea, Toggle } from '@/components/ui'

export function RemoveDuplicates() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [removeEmpty, setRemoveEmpty] = useState(false)
  const [stats, setStats] = useState<{ original: number; unique: number; removed: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState('')
  const colors = useThemeColors()

  const handleRemove = () => {
    let lines = input.split('\n')
    if (removeEmpty) {
      lines = lines.filter((l) => l.trim() !== '')
    }
    const seen = new Set<string>()
    const unique: string[] = []
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(line)
      }
    }
    const removed = lines.length - unique.length
    setStats({ original: lines.length, unique: unique.length, removed })
    setOutput(unique.join('\n'))
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleSave = async () => {
    await window.api.saveFile('no-duplicates.txt', output)
  }

  const handleOpenFile = async () => {
    try {
      const result = await window.api.openFile()
      if (result) {
        setInput(result.content)
        setFileName(result.name)
        setOutput('')
        setStats(null)
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Remove Duplicate Lines"
        description="Remove duplicate lines from text, preserving first occurrence"
        category="file"
        icon={CopyX}
        serial="remove-duplicates"
      />

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <SectionLabel hint={fileName || undefined}>Input</SectionLabel>
          <Button variant="ghost" size="sm" icon={FolderOpen} onClick={handleOpenFile}>
            Open File
          </Button>
        </div>
        <Textarea
          className="tb-field tb-mono"
          placeholder="Paste your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '100%', minHeight: 180 }}
        />
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <Toggle checked={caseSensitive} onChange={setCaseSensitive} label="Case sensitive" />
              <span style={{ fontSize: 13.5, color: colors.text }}>Case sensitive</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <Toggle checked={removeEmpty} onChange={setRemoveEmpty} label="Remove empty lines" />
              <span style={{ fontSize: 13.5, color: colors.text }}>Remove empty lines</span>
            </span>
          </div>
          <Button variant="primary" size="lg" icon={Zap} onClick={handleRemove} disabled={!input.trim()}>
            Remove Duplicates
          </Button>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <SectionLabel>Output</SectionLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopy}
              disabled={!output}
              style={copied ? { color: colors.success } : undefined}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="ghost" size="sm" icon={Download} onClick={handleSave} disabled={!output}>
              Save to file
            </Button>
          </div>
        </div>
        <Textarea
          className="tb-field tb-mono"
          placeholder="Result will appear here..."
          value={output}
          readOnly
          style={{ width: '100%', minHeight: 180, backgroundColor: colors.bgDeep }}
        />
      </Card>

      {stats && (
        <Card>
          <SectionLabel>Results</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', columnGap: 20, rowGap: 8, flexWrap: 'wrap' }}>
            {[
              { value: stats.original.toLocaleString(), label: 'Original lines', color: colors.text },
              { value: stats.unique.toLocaleString(), label: 'Unique', color: colors.accent },
              { value: stats.removed.toLocaleString(), label: 'Removed', color: colors.error }
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
                {i > 0 && <span aria-hidden style={{ width: 1, height: 14, backgroundColor: colors.border }} />}
                <span
                  className="tb-mono"
                  style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.02em', color: item.color }}
                >
                  {item.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 10.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: colors.textFaint
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p
            className="tb-mono"
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${colors.border}`,
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint
            }}
          >
            {stats.original.toLocaleString()} lines processed ·{' '}
            {((stats.removed / stats.original) * 100).toFixed(1)}% duplicates removed
          </p>
        </Card>
      )}
    </div>
  )
}
