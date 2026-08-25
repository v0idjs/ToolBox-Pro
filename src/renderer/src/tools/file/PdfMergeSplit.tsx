import { useState, useRef, useCallback } from 'react'
import {
  FileStack,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  Merge,
  Scissors
} from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Select, Input } from '@/components/ui'

interface PdfDoc {
  id: string
  name: string
  size: number
  bytes: Uint8Array
  pageCount: number
}

type SplitMode = 'range' | 'chunks'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function parseRanges(input: string, maxPage: number): number[] | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const pages: number[] = []
  for (const part of trimmed.split(',')) {
    const seg = part.trim()
    if (!seg) continue
    const match = seg.match(/^(\d+)(?:\s*-\s*(\d+))?$/)
    if (!match) return null
    const start = parseInt(match[1], 10)
    const end = match[2] ? parseInt(match[2], 10) : start
    if (start < 1 || end < start || end > maxPage) return null
    for (let p = start; p <= end; p++) pages.push(p)
  }
  return pages.length > 0 ? pages : null
}

export function PdfMergeSplit() {
  const colors = useThemeColors()
  const [docs, setDocs] = useState<PdfDoc[]>([])
  const [mode, setMode] = useState<'merge' | 'split'>('merge')
  const [splitMode, setSplitMode] = useState<SplitMode>('range')
  const [splitTargetId, setSplitTargetId] = useState<string>('')
  const [rangeInput, setRangeInput] = useState('')
  const [chunkSize, setChunkSize] = useState(1)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      const pdfFiles = Array.from(fileList).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      )
      if (pdfFiles.length === 0) {
        setStatus({ kind: 'error', text: 'No PDF files found in selection' })
        return
      }
      setStatus(null)
      pdfFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const bytes = new Uint8Array(e.target?.result as ArrayBuffer)
          try {
            const doc = await PDFDocument.load(bytes)
            const entry: PdfDoc = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              size: file.size,
              bytes,
              pageCount: doc.getPageCount()
            }
            setDocs((prev) => [...prev, entry])
            setSplitTargetId((prev) => prev || entry.id)
          } catch {
            setStatus({
              kind: 'error',
              text: `${file.name} is encrypted or not a readable PDF — skipped`
            })
          }
        }
        reader.readAsArrayBuffer(file)
      })
    },
    []
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    loadFiles(e.dataTransfer.files)
  }

  const moveDoc = (id: string, dir: -1 | 1) => {
    setDocs((prev) => {
      const idx = prev.findIndex((d) => d.id === id)
      const next = idx + dir
      if (idx < 0 || next < 0 || next >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[next]] = [copy[next], copy[idx]]
      return copy
    })
  }

  const removeDoc = (id: string) => {
    setDocs((prev) => {
      const remaining = prev.filter((d) => d.id !== id)
      if (splitTargetId === id) setSplitTargetId(remaining[0]?.id ?? '')
      return remaining
    })
  }

  const savePdf = async (bytes: Uint8Array, defaultName: string): Promise<boolean> => {
    const saved = await window.api.saveFileBinary(
      defaultName,
      bytesToBase64(bytes),
      [{ name: 'PDF document', extensions: ['pdf'] }]
    )
    return saved !== null
  }

  const handleMerge = async () => {
    const valid = docs
    if (valid.length === 0) return
    setBusy(true)
    setStatus(null)
    try {
      const out = await PDFDocument.create()
      let totalPages = 0
      for (const doc of valid) {
        const src = await PDFDocument.load(doc.bytes)
        const pages = await out.copyPages(src, src.getPageIndices())
        pages.forEach((page) => out.addPage(page))
        totalPages += pages.length
      }
      const bytes = await out.save()
      const saved = await savePdf(bytes, 'merged.pdf')
      if (saved) {
        setStatus({ kind: 'ok', text: `Merged ${valid.length} documents · ${totalPages} pages` })
      }
    } catch (err) {
      setStatus({ kind: 'error', text: `Merge failed: ${(err as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  const handleSplit = async () => {
    const target = docs.find((d) => d.id === splitTargetId)
    if (!target) return
    setBusy(true)
    setStatus(null)
    try {
      const src = await PDFDocument.load(target.bytes)
      const baseName = target.name.replace(/\.pdf$/i, '')
      if (splitMode === 'range') {
        const pages = parseRanges(rangeInput, target.pageCount)
        if (!pages) {
          setStatus({
            kind: 'error',
            text: `Enter pages between 1 and ${target.pageCount}, e.g. "1-3, 5"`
          })
          return
        }
        const out = await PDFDocument.create()
        const copied = await out.copyPages(src, pages.map((p) => p - 1))
        copied.forEach((page) => out.addPage(page))
        const bytes = await out.save()
        const label = rangeInput.replace(/\s+/g, '')
        const saved = await savePdf(bytes, `${baseName}-pages-${label}.pdf`)
        if (saved) {
          setStatus({ kind: 'ok', text: `Extracted ${pages.length} pages from ${target.name}` })
        }
      } else {
        const perPart = Math.max(1, Math.floor(chunkSize))
        const partCount = Math.ceil(target.pageCount / perPart)
        let savedCount = 0
        for (let part = 0; part < partCount; part++) {
          const out = await PDFDocument.create()
          const indices = []
          for (let p = part * perPart; p < Math.min((part + 1) * perPart, target.pageCount); p++) {
            indices.push(p)
          }
          const copied = await out.copyPages(src, indices)
          copied.forEach((page) => out.addPage(page))
          const bytes = await out.save()
          const partNum = String(part + 1).padStart(2, '0')
          const saved = await savePdf(bytes, `${baseName}-part-${partNum}.pdf`)
          if (!saved) break
          savedCount++
        }
        if (savedCount > 0) {
          const note = savedCount < partCount ? ` (cancelled after ${savedCount})` : ''
          setStatus({
            kind: 'ok',
            text: `Split ${target.name} into ${savedCount} of ${partCount} parts${note}`
          })
        }
      }
    } catch (err) {
      setStatus({ kind: 'error', text: `Split failed: ${(err as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  const totalPages = docs.reduce((sum, d) => sum + d.pageCount, 0)
  const totalSize = docs.reduce((sum, d) => sum + d.size, 0)
  const splitTarget = docs.find((d) => d.id === splitTargetId)

  const modeButton = (value: 'merge' | 'split', label: string, Icon: typeof Merge) => (
    <button
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 14px',
        borderRadius: 'var(--tb-radius-ctl)',
        border: `1px solid ${mode === value ? colors.accent : colors.border}`,
        backgroundColor: mode === value ? colors.accentTint : 'transparent',
        color: mode === value ? colors.text : colors.textSecondary,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer'
      }}
    >
      <Icon size={14} color={mode === value ? colors.accent : colors.textFaint} />
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="PDF Merger & Splitter"
        description="Combine PDF files or extract and split pages into new documents"
        category="file"
        icon={FileStack}
        serial="pdf-merge-split"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
          border: `1px dashed ${isDragging ? colors.accent : colors.borderStrong}`,
          borderRadius: 'var(--tb-radius-panel)',
          backgroundColor: isDragging ? colors.accentTint : colors.raised,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          textAlign: 'center'
        }}
      >
        <Upload size={22} color={isDragging ? colors.accent : colors.textFaint} />
        <span style={{ fontSize: 13.5, color: colors.text }}>
          Drop PDFs here or click to browse
        </span>
        <span
          style={{
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 11,
            color: colors.textFaint
          }}
        >
          Files stay on this machine · encrypted PDFs are skipped
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            loadFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {docs.length > 0 && (
        <Card>
          <SectionLabel hint={`${docs.length} files · ${totalPages} pages · ${formatSize(totalSize)}`}>
            Loaded documents
          </SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {docs.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 4px',
                  borderTop: i > 0 ? `1px solid ${colors.border}` : 'none'
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 11,
                    color: colors.textFaint,
                    width: 20,
                    textAlign: 'right'
                  }}
                >
                  {mode === 'merge' ? String(i + 1).padStart(2, '0') : '··'}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: colors.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {doc.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 11,
                      color: colors.textFaint
                    }}
                  >
                    {doc.pageCount} pages · {formatSize(doc.size)}
                  </span>
                </span>
                {mode === 'merge' && (
                  <span style={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Move ${doc.name} up`}
                      disabled={i === 0}
                      onClick={() => moveDoc(doc.id, -1)}
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Move ${doc.name} down`}
                      disabled={i === docs.length - 1}
                      onClick={() => moveDoc(doc.id, 1)}
                    >
                      <ChevronDown size={14} />
                    </Button>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${doc.name}`}
                  onClick={() => removeDoc(doc.id)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 8 }}>{modeButton('merge', 'Merge', Merge)}{modeButton('split', 'Split', Scissors)}</div>

      {status && (
        <div
          role={status.kind === 'error' ? 'alert' : 'status'}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--tb-radius-ctl)',
            fontSize: 13,
            backgroundColor: status.kind === 'error' ? `${colors.error}15` : `${colors.success}15`,
            border: `1px solid ${status.kind === 'error' ? colors.error : colors.success}`,
            color: status.kind === 'error' ? colors.error : colors.success
          }}
        >
          {status.text}
        </div>
      )}

      {mode === 'merge' && (
        <Card>
          <SectionLabel hint="Output order follows the list above">Merge</SectionLabel>
          <p style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 14 }}>
            Pages are concatenated in list order into a single document.
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={busy ? undefined : Merge}
            disabled={docs.length < 1}
            isLoading={busy}
            onClick={handleMerge}
          >
            {busy ? 'Merging…' : `Merge ${docs.length > 0 ? `${docs.length} files` : 'PDFs'}`}
          </Button>
        </Card>
      )}

      {mode === 'split' && (
        <Card>
          <SectionLabel hint={splitTarget ? `${splitTarget.pageCount} pages` : undefined}>
            Split
          </SectionLabel>
          {docs.length === 0 ? (
            <p style={{ fontSize: 12.5, color: colors.textSecondary }}>Load a PDF above first.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Select
                label="Source document"
                value={splitTargetId}
                onChange={(e) => setSplitTargetId(e.target.value)}
              >
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pageCount} pages)
                  </option>
                ))}
              </Select>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSplitMode('range')}
                  aria-pressed={splitMode === 'range'}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--tb-radius-ctl)',
                    border: `1px solid ${splitMode === 'range' ? colors.accent : colors.border}`,
                    backgroundColor: splitMode === 'range' ? colors.accentTint : colors.raised,
                    color: splitMode === 'range' ? colors.text : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Extract page ranges
                </button>
                <button
                  onClick={() => setSplitMode('chunks')}
                  aria-pressed={splitMode === 'chunks'}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--tb-radius-ctl)',
                    border: `1px solid ${splitMode === 'chunks' ? colors.accent : colors.border}`,
                    backgroundColor: splitMode === 'chunks' ? colors.accentTint : colors.raised,
                    color: splitMode === 'chunks' ? colors.text : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Chunk every N pages
                </button>
              </div>

              {splitMode === 'range' ? (
                <Input
                  label="Pages to extract"
                  placeholder="e.g. 1-3, 5, 8-10"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                />
              ) : (
                <Input
                  label="Pages per part"
                  type="number"
                  min={1}
                  max={splitTarget?.pageCount ?? 1}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value) || 1)}
                  hint={
                    splitTarget
                      ? `Produces ${Math.ceil(splitTarget.pageCount / Math.max(1, chunkSize))} file(s) — each opens its own Save dialog`
                      : undefined
                  }
                />
              )}

              <div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={busy ? undefined : Scissors}
                  disabled={!splitTarget}
                  isLoading={busy}
                  onClick={handleSplit}
                >
                  {busy ? 'Working…' : 'Split PDF'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
