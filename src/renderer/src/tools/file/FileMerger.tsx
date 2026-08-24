import { useState } from 'react'
import { FolderOpen, Merge, Save, Trash2, ArrowUp, ArrowDown, Zap, Copy, Check } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

interface FileEntry {
  id: string
  name: string
  size: number
  content: string
}

export function FileMerger() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [separator, setSeparator] = useState<'none' | 'newline' | 'custom'>('none')
  const [customSep, setCustomSep] = useState('')
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const colors = useThemeColors()

  const loadFiles = async () => {
    const loaded = await window.api.openFiles()
    if (!loaded) return
    setFiles((prev) => {
      const newFiles: FileEntry[] = loaded.map((f: { name: string; content: string }) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        size: new Blob([f.content]).size,
        content: f.content,
      }))
      return [...prev, ...newFiles]
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const getSeparator = () => {
    switch (separator) {
      case 'newline':
        return '\n'
      case 'custom':
        return customSep
      case 'none':
      default:
        return ''
    }
  }

  const mergeFiles = () => {
    const sep = getSeparator()
    const merged = files.map((f) => f.content).join(sep)
    setResult(merged)
  }

  const saveResult = async () => {
    if (!result) return
    await window.api.saveFile('merged-output.txt', result)
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  const separators: { id: 'none' | 'newline' | 'custom'; label: string }[] = [
    { id: 'none', label: 'No separator' },
    { id: 'newline', label: 'Newline' },
    { id: 'custom', label: 'Custom string' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="File Merger"
        description="Merge multiple text files into one combined file"
        category="file"
        icon={Merge}
        serial="file-merger"
      />

      <Card>
        <SectionLabel hint={files.length > 0 ? `Total ${totalSize.toLocaleString()} bytes` : undefined}>
          Files
        </SectionLabel>
        <Button variant="secondary" icon={FolderOpen} onClick={loadFiles}>
          Open Files
        </Button>

        {files.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 13.5, color: colors.textSecondary }}>
              {files.length} file{files.length !== 1 ? 's' : ''} loaded
            </span>
            <div style={{ marginTop: 8 }}>
              {files.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 4px',
                    borderBottom: i < files.length - 1 ? `1px solid ${colors.border}` : 'none',
                  }}
                >
                  <button
                    onClick={() => moveFile(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${f.name} up`}
                    style={{
                      display: 'flex',
                      padding: 3,
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--tb-radius-ctl)',
                      color: i === 0 ? colors.textFaint : colors.textSecondary,
                      cursor: i === 0 ? 'default' : 'pointer',
                    }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveFile(i, 1)}
                    disabled={i === files.length - 1}
                    aria-label={`Move ${f.name} down`}
                    style={{
                      display: 'flex',
                      padding: 3,
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--tb-radius-ctl)',
                      color: i === files.length - 1 ? colors.textFaint : colors.textSecondary,
                      cursor: i === files.length - 1 ? 'default' : 'pointer',
                    }}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <span
                    className="tb-mono"
                    style={{ flex: 1, fontSize: 12.5, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {f.name}
                  </span>
                  <span
                    className="tb-mono"
                    style={{ fontSize: 12, color: colors.textFaint, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                  >
                    {f.size.toLocaleString()} B
                  </span>
                  <button
                    onClick={() => removeFile(f.id)}
                    aria-label={`Remove ${f.name}`}
                    style={{
                      display: 'flex',
                      padding: 3,
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--tb-radius-ctl)',
                      color: colors.error,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {files.length > 0 && (
        <Card>
          <SectionLabel>Separator</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {separators.map((sep) => (
              <Button
                key={sep.id}
                variant="secondary"
                onClick={() => setSeparator(sep.id)}
                style={
                  separator === sep.id
                    ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
                    : undefined
                }
              >
                {sep.label}
              </Button>
            ))}
          </div>
          {separator === 'custom' && (
            <div style={{ marginTop: 12 }}>
              <Input
                value={customSep}
                onChange={(e) => setCustomSep(e.target.value)}
                placeholder="Enter separator string"
              />
            </div>
          )}
        </Card>
      )}

      {files.length > 0 && (
        <div>
          <Button variant="primary" size="lg" icon={Zap} onClick={mergeFiles}>
            Merge Files
          </Button>
        </div>
      )}

      {result && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <SectionLabel hint={`${result.length.toLocaleString()} chars`}>Result</SectionLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="ghost"
                size="sm"
                icon={Save}
                onClick={saveResult}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopy}
                style={copied ? { color: colors.success } : undefined}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
          <div
            className="tb-mono"
            style={{
              backgroundColor: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-ctl)',
              padding: 14,
              fontSize: 12.5,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: 300,
              overflow: 'auto',
              color: colors.text,
            }}
          >
            {result.length > 500 ? result.slice(0, 500) + '\n... (truncated)' : result}
          </div>
          <p
            className="tb-mono"
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${colors.border}`,
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint,
            }}
          >
            {files.length} files merged · {result.length.toLocaleString()} characters ·{' '}
            {new Blob([result]).size.toLocaleString()} bytes
          </p>
        </Card>
      )}
    </div>
  )
}
