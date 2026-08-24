import { useState } from 'react'
import { FolderOpen, Scissors, Save, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

type SplitMode = 'lines' | 'size' | 'parts'

interface ChunkResult {
  index: number
  lines: number
  sizeKB: number
}

export function FileSplitter() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [splitMode, setSplitMode] = useState<SplitMode>('lines')
  const [linesPerChunk, setLinesPerChunk] = useState(1000)
  const [kbPerChunk, setKbPerChunk] = useState(500)
  const [numParts, setNumParts] = useState(2)
  const [results, setResults] = useState<ChunkResult[]>([])
  const [processing, setProcessing] = useState(false)
  const colors = useThemeColors()

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
  }

  const handleOpenFile = async () => {
    try {
      const result = await window.api.openFile()
      if (result) {
        setFileName(result.name)
        setFileContent(result.content)
        setFileSize(result.size)
        setResults([])
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }

  const handleSplit = async () => {
    if (!fileContent || !fileName) return
    setProcessing(true)
    setResults([])

    try {
      const lines = fileContent.split(/\r?\n/)
      const chunks: ChunkResult[] = []
      let chunkIndex = 0

      if (splitMode === 'lines') {
        const chunkSize = Math.max(1, linesPerChunk)
        for (let i = 0; i < lines.length; i += chunkSize) {
          const chunkLines = lines.slice(i, i + chunkSize)
          const chunkContent = chunkLines.join('\n')
          const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`
          await window.api.saveFile(chunkFileName, chunkContent)
          chunks.push({
            index: chunkIndex + 1,
            lines: chunkLines.length,
            sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
          })
          chunkIndex++
        }
      } else if (splitMode === 'parts') {
        const parts = Math.max(2, Math.min(100, numParts))
        const linesPerPart = Math.ceil(lines.length / parts)
        for (let i = 0; i < lines.length; i += linesPerPart) {
          const chunkLines = lines.slice(i, i + linesPerPart)
          const chunkContent = chunkLines.join('\n')
          const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`
          await window.api.saveFile(chunkFileName, chunkContent)
          chunks.push({
            index: chunkIndex + 1,
            lines: chunkLines.length,
            sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
          })
          chunkIndex++
        }
      } else {
        const maxBytes = Math.max(1, kbPerChunk) * 1024
        let currentChunk: string[] = []
        let currentSize = 0
        for (const line of lines) {
          const lineBytes = new Blob([line + '\n']).size
          if (currentSize + lineBytes > maxBytes && currentChunk.length > 0) {
            const chunkContent = currentChunk.join('\n')
            const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`
            await window.api.saveFile(chunkFileName, chunkContent)
            chunks.push({
              index: chunkIndex + 1,
              lines: currentChunk.length,
              sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
            })
            chunkIndex++
            currentChunk = []
            currentSize = 0
          }
          currentChunk.push(line)
          currentSize += lineBytes
        }
        if (currentChunk.length > 0) {
          const chunkContent = currentChunk.join('\n')
          const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`
          await window.api.saveFile(chunkFileName, chunkContent)
          chunks.push({
            index: chunkIndex + 1,
            lines: currentChunk.length,
            sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
          })
        }
      }

      setResults(chunks)
    } catch (err) {
      console.error('Failed to split file:', err)
    } finally {
      setProcessing(false)
    }
  }

  const modes: { id: SplitMode; label: string }[] = [
    { id: 'lines', label: 'By Line Count' },
    { id: 'size', label: 'By File Size (KB)' },
    { id: 'parts', label: 'By Parts' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="File Splitter"
        description="Split large files into smaller chunks by line count or size"
        category="file"
        icon={Scissors}
        serial="file-splitter"
      />

      <Card>
        <SectionLabel>Source</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={FolderOpen} onClick={handleOpenFile}>
            Open File
          </Button>
          {fileName && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span className="tb-mono" style={{ fontSize: 12.5, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileName}
              </span>
              <span className="tb-mono" style={{ fontSize: 11, letterSpacing: '0.04em', color: colors.textFaint }}>
                {formatBytes(fileSize)}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <SectionLabel>Split mode</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {modes.map((mode) => (
            <Button
              key={mode.id}
              variant="secondary"
              onClick={() => setSplitMode(mode.id)}
              style={
                splitMode === mode.id
                  ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
                  : undefined
              }
            >
              {mode.label}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          min={splitMode === 'parts' ? 2 : 1}
          max={splitMode === 'parts' ? 100 : undefined}
          value={splitMode === 'lines' ? linesPerChunk : splitMode === 'size' ? kbPerChunk : numParts}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10) || 1;
            if (splitMode === 'lines') setLinesPerChunk(val);
            else if (splitMode === 'size') setKbPerChunk(val);
            else setNumParts(Math.max(2, Math.min(100, val)));
          }}
          label={
            splitMode === 'lines'
              ? 'Lines per chunk'
              : splitMode === 'size'
                ? 'KB per chunk'
                : 'Number of parts'
          }
        />
      </Card>

      <div>
        <Button
          variant="primary"
          size="lg"
          icon={Zap}
          onClick={handleSplit}
          disabled={!fileContent || processing}
          isLoading={processing}
        >
          {processing ? 'Splitting...' : 'Split File'}
        </Button>
      </div>

      {results.length > 0 && (
        <Card>
          <SectionLabel hint={`${results.length} chunk${results.length !== 1 ? 's' : ''} created`}>
            Results
          </SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {results.map((chunk, i) => (
              <div
                key={chunk.index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '11px 4px',
                  borderBottom: i < results.length - 1 ? `1px solid ${colors.border}` : 'none',
                }}
              >
                <span className="tb-mono" style={{ fontSize: 13.5, fontWeight: 600, color: colors.text }}>
                  Part {chunk.index}
                </span>
                <span className="tb-mono" style={{ fontSize: 12, color: colors.textSecondary }}>
                  {chunk.lines.toLocaleString()} lines · {chunk.sizeKB} KB
                </span>
                <Save size={14} color={colors.textFaint} />
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
              color: colors.textFaint,
            }}
          >
            Total: {results.length} parts · {results.reduce((a, c) => a + c.lines, 0).toLocaleString()} lines ·{' '}
            {results.reduce((a, c) => a + c.sizeKB, 0).toFixed(2)} KB
          </p>
        </Card>
      )}
    </div>
  )
}
