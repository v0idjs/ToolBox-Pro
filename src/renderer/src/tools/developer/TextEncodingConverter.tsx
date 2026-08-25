import { useState, useRef, useMemo } from 'react'
import { Languages, Upload, FileText, ClipboardPaste, X, Copy, Check, Save } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Select, Textarea } from '@/components/ui'

type SourceEncoding = 'auto' | 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1252' | 'ascii'
type TargetEncoding = 'utf-8' | 'utf-8-bom' | 'utf-16le' | 'utf-16be' | 'ascii'

const SOURCE_OPTIONS: { value: SourceEncoding; label: string }[] = [
  { value: 'auto', label: 'Auto-detect (BOM, else UTF-8)' },
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'utf-16le', label: 'UTF-16 LE' },
  { value: 'utf-16be', label: 'UTF-16 BE' },
  { value: 'windows-1252', label: 'Windows-1252 / Latin-1' },
  { value: 'ascii', label: 'ASCII (7-bit)' }
]

const TARGET_OPTIONS: { value: TargetEncoding; label: string }[] = [
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'utf-8-bom', label: 'UTF-8 with BOM' },
  { value: 'utf-16le', label: 'UTF-16 LE (with BOM)' },
  { value: 'utf-16be', label: 'UTF-16 BE (with BOM)' },
  { value: 'ascii', label: 'ASCII (7-bit, ? replaces non-ASCII)' }
]

const TARGET_SUFFIX: Record<TargetEncoding, string> = {
  'utf-8': 'utf8',
  'utf-8-bom': 'utf8-bom',
  'utf-16le': 'utf16le',
  'utf-16be': 'utf16be',
  ascii: 'ascii'
}

function detectBom(bytes: Uint8Array): 'utf-8' | 'utf-16le' | 'utf-16be' | null {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return 'utf-8'
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le'
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be'
  return null
}

function decodeBytes(bytes: Uint8Array, encoding: SourceEncoding): { text: string; used: string } {
  let label: string
  if (encoding === 'auto') {
    label = detectBom(bytes) ?? 'utf-8'
  } else if (encoding === 'ascii') {
    label = 'windows-1252'
  } else {
    label = encoding
  }
  const text = new TextDecoder(label).decode(bytes)
  return { text, used: label }
}

function encodeText(text: string, encoding: TargetEncoding): { bytes: Uint8Array; replaced: number } {
  if (encoding === 'utf-8' || encoding === 'utf-8-bom') {
    const encoded = new TextEncoder().encode(text)
    if (encoding === 'utf-8') return { bytes: encoded, replaced: 0 }
    const out = new Uint8Array(encoded.length + 3)
    out[0] = 0xef
    out[1] = 0xbb
    out[2] = 0xbf
    out.set(encoded, 3)
    return { bytes: out, replaced: 0 }
  }
  if (encoding === 'utf-16le' || encoding === 'utf-16be') {
    const little = encoding === 'utf-16le'
    const out = new Uint8Array(2 + text.length * 2)
    out[0] = little ? 0xff : 0xfe
    out[1] = little ? 0xfe : 0xff
    for (let i = 0; i < text.length; i++) {
      const unit = text.charCodeAt(i)
      if (little) {
        out[2 + i * 2] = unit & 0xff
        out[3 + i * 2] = unit >> 8
      } else {
        out[2 + i * 2] = unit >> 8
        out[3 + i * 2] = unit & 0xff
      }
    }
    return { bytes: out, replaced: 0 }
  }
  const out = new Uint8Array(text.length)
  let replaced = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code > 127) {
      out[i] = 0x3f
      replaced++
    } else {
      out[i] = code
    }
  }
  return { bytes: out, replaced }
}

function toHexDump(bytes: Uint8Array, maxBytes = 48): string {
  const slice = bytes.subarray(0, maxBytes)
  const rows: string[] = []
  for (let i = 0; i < slice.length; i += 16) {
    const chunk = Array.from(slice.subarray(i, i + 16))
    const hex = chunk.map((b) => b.toString(16).padStart(2, '0')).join(' ')
    const ascii = chunk.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '·')).join('')
    rows.push(`${i.toString(16).padStart(8, '0')}  ${hex.padEnd(47)}  ${ascii}`)
  }
  if (bytes.length > maxBytes) rows.push(`… ${bytes.length - maxBytes} more bytes`)
  return rows.join('\n')
}

export function TextEncodingConverter() {
  const colors = useThemeColors()
  const [inputMode, setInputMode] = useState<'paste' | 'file'>('paste')
  const [pastedText, setPastedText] = useState('')
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [sourceEncoding, setSourceEncoding] = useState<SourceEncoding>('auto')
  const [targetEncoding, setTargetEncoding] = useState<TargetEncoding>('utf-8')
  const [copied, setCopied] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setFileBytes(new Uint8Array(e.target?.result as ArrayBuffer))
      setFileName(file.name)
      setFileSize(file.size)
    }
    reader.readAsArrayBuffer(file)
  }

  const decoded = useMemo(() => {
    if (inputMode === 'paste') {
      return { text: pastedText, used: 'utf-8 (pasted)', undecoded: 0 }
    }
    if (!fileBytes) return null
    const { text, used } = decodeBytes(fileBytes, sourceEncoding)
    const undecoded = (text.match(/\uFFFD/g) || []).length
    return { text, used, undecoded }
  }, [inputMode, pastedText, fileBytes, sourceEncoding])

  const encoded = useMemo(() => {
    if (!decoded || !decoded.text) return null
    const { bytes, replaced } = encodeText(decoded.text, targetEncoding)
    return { bytes, replaced }
  }, [decoded, targetEncoding])

  const handleSave = async () => {
    if (!encoded) return
    setSaveError('')
    const baseName =
      inputMode === 'file' && fileName ? fileName.replace(/\.[^.]+$/, '') : 'converted'
    try {
      let binary = ''
      const chunkSize = 0x8000
      for (let i = 0; i < encoded.bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...encoded.bytes.subarray(i, i + chunkSize))
      }
      const saved = await window.api.saveFileBinary(
        `${baseName}-${TARGET_SUFFIX[targetEncoding]}.txt`,
        btoa(binary),
        [{ name: 'Text document', extensions: ['txt'] }]
      )
      if (saved === null) {
        setSaveError('Save was cancelled or the location is not allowed.')
      }
    } catch (err) {
      setSaveError(`Save failed: ${(err as Error).message}`)
    }
  }

  const handleCopy = async () => {
    if (!decoded) return
    try {
      await navigator.clipboard.writeText(decoded.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const stats = encoded
    ? `${decoded?.text.length ?? 0} chars in · ${encoded.bytes.length} bytes out${
        encoded.replaced > 0 ? ` · ${encoded.replaced} replaced with ?` : ''
      }${decoded && decoded.undecoded > 0 ? ` · ${decoded.undecoded} undecodable` : ''}`
    : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Text Encoding Converter"
        description="Convert text and files between UTF-8, UTF-16, Windows-1252, and ASCII"
        category="developer"
        icon={Languages}
        serial="text-encoding-converter"
      />

      <Card>
        <SectionLabel hint={decoded ? `decoded as ${decoded.used}` : undefined}>Input</SectionLabel>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Button
            variant={inputMode === 'paste' ? 'secondary' : 'ghost'}
            size="sm"
            icon={ClipboardPaste}
            onClick={() => setInputMode('paste')}
          >
            Paste text
          </Button>
          <Button
            variant={inputMode === 'file' ? 'secondary' : 'ghost'}
            size="sm"
            icon={FileText}
            onClick={() => setInputMode('file')}
          >
            Load file
          </Button>
        </div>

        {inputMode === 'paste' ? (
          <Textarea
            placeholder="Paste text to convert…"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            mono
            style={{ minHeight: 140 }}
          />
        ) : (
          <div>
            {fileBytes ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--tb-radius-ctl)',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.raised
                }}
              >
                <FileText size={16} color={colors.accent} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: colors.text }}>
                  {fileName}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 11,
                    color: colors.textFaint
                  }}
                >
                  {fileSize} bytes
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Remove file"
                  onClick={() => {
                    setFileBytes(null)
                    setFileName('')
                    setFileSize(0)
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                style={{
                  border: `1px dashed ${colors.borderStrong}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  backgroundColor: colors.raised,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Upload size={18} color={colors.textFaint} />
                <span style={{ fontSize: 13, color: colors.textSecondary }}>
                  Click to load a file — read as raw bytes
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) loadFile(file)
                e.target.value = ''
              }}
            />
          </div>
        )}

        <div style={{ marginTop: 14, maxWidth: 360 }}>
          <Select
            label="Source encoding"
            value={sourceEncoding}
            onChange={(e) => setSourceEncoding(e.target.value as SourceEncoding)}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <SectionLabel hint={stats || undefined}>Output</SectionLabel>

        <div style={{ maxWidth: 360, marginBottom: 14 }}>
          <Select
            label="Target encoding"
            value={targetEncoding}
            onChange={(e) => setTargetEncoding(e.target.value as TargetEncoding)}
          >
            {TARGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {decoded && (
          <>
            <Textarea
              label="Converted text"
              value={decoded.text.slice(0, 4000) + (decoded.text.length > 4000 ? '\n… (truncated preview)' : '')}
              readOnly
              mono
              style={{ minHeight: 120, color: colors.textSecondary }}
            />

            {encoded && (
              <div style={{ marginTop: 14 }}>
                <SectionLabel hint={`${encoded.bytes.length} bytes`}>Output bytes</SectionLabel>
                <pre
                  className="tb-mono"
                  style={{
                    margin: 0,
                    padding: '10px 12px',
                    borderRadius: 'var(--tb-radius-ctl)',
                    backgroundColor: colors.bgDeep,
                    border: `1px solid ${colors.border}`,
                    fontSize: 11.5,
                    lineHeight: 1.7,
                    color: colors.textSecondary,
                    overflowX: 'auto'
                  }}
                >
                  {toHexDump(encoded.bytes)}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button variant="primary" icon={Save} disabled={!encoded} onClick={handleSave}>
                Save converted file
              </Button>
              <Button variant="secondary" icon={copied ? Check : Copy} onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy text'}
              </Button>
            </div>

            {saveError && (
              <p role="alert" style={{ marginTop: 10, fontSize: 12.5, color: colors.error }}>
                {saveError}
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
