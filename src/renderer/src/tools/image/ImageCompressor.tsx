import { useState, useCallback, useRef } from 'react'
import { Upload, Download, Minimize2, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>('')
  const [compressedPreview, setCompressedPreview] = useState<string>('')
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('jpeg')
  const [compressing, setCompressing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colors = useThemeColors()

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setOriginalFile(file)
    setCompressedPreview('')
    setCompressedBlob(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleCompress = useCallback(async () => {
    if (!originalFile) return
    setCompressing(true)
    try {
      const img = new window.Image()
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(originalFile)
      })
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.src = dataUrl
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')
      ctx.drawImage(img, 0, 0)

      const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Canvas toBlob returned null'))
          },
          mimeType,
          outputFormat === 'jpeg' ? quality / 100 : undefined
        )
      })

      if (compressedPreview) URL.revokeObjectURL(compressedPreview)
      const url = URL.createObjectURL(blob)
      setCompressedPreview(url)
      setCompressedBlob(blob)
    } catch {
    }
    setCompressing(false)
  }, [originalFile, quality, outputFormat, compressedPreview])

  const handleDownload = useCallback(() => {
    if (!compressedBlob || !originalFile) return
    const ext = outputFormat === 'png' ? '.png' : '.jpg'
    const name = originalFile.name.replace(/\.[^.]+$/, '') + '_compressed' + ext
    const url = URL.createObjectURL(compressedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }, [compressedBlob, originalFile, outputFormat])

  const originalSize = originalFile?.size ?? 0
  const compressedSize = compressedBlob?.size ?? 0
  const ratio =
    originalSize > 0 && compressedSize > 0
      ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
      : null

  return (
    <div>
      <ToolHeader
        name="Image Compressor"
        description="Reduce image file size with adjustable quality."
        category="image"
        icon={Minimize2}
        serial="image-compressor"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        style={{ display: 'none' }}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1px dashed ${dragOver ? colors.accent : colors.borderStrong}`,
          borderRadius: 'var(--tb-radius-panel)',
          background: dragOver ? colors.accentTint : colors.raised,
          padding: originalPreview ? 20 : '56px 24px',
          cursor: 'pointer',
          textAlign: 'center',
          transition:
            'border-color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease',
          display: originalPreview ? 'flex' : 'block',
          gap: 20,
          alignItems: 'center',
          marginBottom: 16
        }}
      >
        {originalPreview ? (
          <>
            <img
              src={originalPreview}
              alt="Original"
              style={{
                maxWidth: '100%',
                maxHeight: 240,
                borderRadius: 'var(--tb-radius-ctl)',
                flex: 1,
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div
                style={{
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 6,
                  wordBreak: 'break-all'
                }}
              >
                {originalFile?.name}
              </div>
              <div
                style={{
                  color: colors.textSecondary,
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 12.5
                }}
              >
                {formatSize(originalSize)}
              </div>
            </div>
          </>
        ) : (
          <>
            <Upload size={40} color={colors.textSecondary} />
            <div style={{ color: colors.textSecondary, fontSize: 15, marginTop: 12 }}>
              Drop an image here or click to select
            </div>
          </>
        )}
      </div>

      <div className="tb-panel" style={{ padding: 20, marginBottom: 16 }}>
        <SectionLabel hint={`${quality}%`}>Quality</SectionLabel>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 11,
            color: colors.textFaint,
            marginTop: 6
          }}
        >
          <span>1</span>
          <span>100</span>
        </div>
        <div style={{ height: 16 }} />
        <SectionLabel>Output format</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['jpeg', 'png'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setOutputFormat(fmt)}
              className="tb-hoverable"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--tb-radius-ctl)',
                border: `1px solid ${outputFormat === fmt ? colors.accent : colors.borderStrong}`,
                background: outputFormat === fmt ? colors.accent : colors.raised,
                color: outputFormat === fmt ? colors.onAccent : colors.text,
                fontSize: 13,
                fontWeight: outputFormat === fmt ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        icon={Zap}
        isLoading={compressing}
        disabled={!originalFile}
        onClick={handleCompress}
        style={{ width: '100%' }}
      >
        {compressing ? 'Compressing...' : 'Compress Image'}
      </Button>

      {compressedPreview && (
        <div className="tb-panel" style={{ padding: 20, marginTop: 16 }}>
          <SectionLabel>Before / After</SectionLabel>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <img
                src={originalPreview}
                alt="Original"
                style={{
                  width: '100%',
                  maxHeight: 260,
                  objectFit: 'contain',
                  borderRadius: 'var(--tb-radius-ctl)',
                  background: colors.bgDeep,
                  display: 'block'
                }}
              />
              <div
                style={{
                  color: colors.textSecondary,
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 12.5,
                  marginTop: 8
                }}
              >
                {formatSize(originalSize)}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <img
                src={compressedPreview}
                alt="Compressed"
                style={{
                  width: '100%',
                  maxHeight: 260,
                  objectFit: 'contain',
                  borderRadius: 'var(--tb-radius-ctl)',
                  background: colors.bgDeep,
                  display: 'block'
                }}
              />
              <div
                style={{
                  color: colors.textSecondary,
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 12.5,
                  marginTop: 8
                }}
              >
                {formatSize(compressedSize)}
              </div>
            </div>
          </div>

          {ratio !== null && (
            <div
              style={{
                textAlign: 'center',
                marginTop: 16,
                padding: 14,
                background: colors.bgDeep,
                border: `1px solid ${colors.border}`,
                borderRadius: 'var(--tb-radius-ctl)'
              }}
            >
              <span
                style={{
                  color: Number(ratio) > 0 ? colors.success : colors.error,
                  fontSize: 26,
                  fontWeight: 700,
                  fontFamily: 'var(--tb-font-display)'
                }}
              >
                {Number(ratio) > 0 ? '-' : '+'}
                {ratio}%
              </span>
              <div style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
                {Number(ratio) > 0
                  ? `Saved ${formatSize(originalSize - compressedSize)}`
                  : `Size increased by ${formatSize(compressedSize - originalSize)}`}
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            size="lg"
            icon={Download}
            onClick={handleDownload}
            style={{ width: '100%', marginTop: 16 }}
          >
            Download Compressed Image
          </Button>
        </div>
      )}
    </div>
  )
}
