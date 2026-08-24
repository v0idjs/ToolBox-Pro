import { useState, useRef, useCallback } from 'react'
import { Upload, Download, RefreshCw, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp'

const FORMAT_OPTIONS: { label: string; value: OutputFormat; mime: string }[] = [
  { label: 'PNG', value: 'image/png', mime: 'png' },
  { label: 'JPEG', value: 'image/jpeg', mime: 'jpg' },
  { label: 'WEBP', value: 'image/webp', mime: 'webp' },
  { label: 'BMP', value: 'image/bmp', mime: 'bmp' }
]

export function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [convertedSize, setConvertedSize] = useState<number | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(92)
  const [isDragging, setIsDragging] = useState(false)
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = useThemeColors()

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setOriginalSize(file.size)
    setConvertedSize(null)
    setConvertedBlob(null)
    setConvertedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        setOriginalImage(img)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadImage(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadImage(file)
  }

  const convertImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = originalImage.naturalWidth
    canvas.height = originalImage.naturalHeight
    ctx.drawImage(originalImage, 0, 0)

    const qualityValue = (outputFormat === 'image/png' || outputFormat === 'image/bmp')
      ? undefined
      : quality / 100

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setConvertedBlob(blob)
          setConvertedSize(blob.size)
          setConvertedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return URL.createObjectURL(blob)
          })
        }
      },
      outputFormat,
      qualityValue
    )
  }, [originalImage, outputFormat, quality])

  const handleDownload = () => {
    if (!convertedBlob) return
    const ext = FORMAT_OPTIONS.find((f) => f.value === outputFormat)?.mime ?? 'png'
    const link = document.createElement('a')
    link.href = URL.createObjectURL(convertedBlob)
    link.download = `converted.${ext}`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleReset = () => {
    setOriginalImage(null)
    setOriginalSize(0)
    setConvertedSize(null)
    setConvertedBlob(null)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setConvertedUrl(null)
    setOutputFormat('image/png')
    setQuality(92)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const showQuality = outputFormat === 'image/jpeg' || outputFormat === 'image/webp'

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <ToolHeader
        name="Image Converter"
        description="Convert images between PNG, JPEG, WEBP, and BMP formats."
        category="image"
        icon={RefreshCw}
        serial="image-converter"
      />

      {!originalImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `1px dashed ${isDragging ? colors.accent : colors.borderStrong}`,
            borderRadius: 'var(--tb-radius-panel)',
            background: isDragging ? colors.accentTint : colors.raised,
            padding: '64px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition:
              'border-color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease'
          }}
        >
          <Upload size={44} color={colors.textSecondary} style={{ marginBottom: 14 }} />
          <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
            Drag and drop an image here, or click to browse
          </p>
          <p
            style={{
              fontSize: 11,
              fontFamily: 'var(--tb-font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.textFaint,
              marginTop: 12
            }}
          >
            PNG · JPEG · WEBP · BMP · GIF
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div className="tb-panel" style={{ flex: '1 1 300px', padding: 20 }}>
              <SectionLabel
                hint={`${originalImage.naturalWidth} × ${originalImage.naturalHeight}`}
              >
                Original
              </SectionLabel>
              <img
                src={originalImage.src}
                alt="Original"
                style={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  borderRadius: 'var(--tb-radius-ctl)',
                  display: 'block'
                }}
              />
              <p
                style={{
                  marginTop: 10,
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 12.5,
                  color: colors.textSecondary
                }}
              >
                {formatSize(originalSize)}
              </p>
            </div>
            {convertedUrl && (
              <div className="tb-panel" style={{ flex: '1 1 300px', padding: 20 }}>
                <SectionLabel>Converted</SectionLabel>
                <img
                  src={convertedUrl}
                  alt="Converted"
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 'var(--tb-radius-ctl)',
                    display: 'block'
                  }}
                />
                <p
                  style={{
                    marginTop: 10,
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 12.5,
                    color: colors.textSecondary
                  }}
                >
                  {convertedSize !== null ? formatSize(convertedSize) : '—'}
                </p>
              </div>
            )}
          </div>

          <div
            className="tb-panel"
            style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div>
              <SectionLabel>Output format</SectionLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setOutputFormat(f.value)}
                    className="tb-hoverable"
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--tb-radius-ctl)',
                      border: `1px solid ${outputFormat === f.value ? colors.accent : colors.borderStrong}`,
                      background: outputFormat === f.value ? colors.accent : colors.raised,
                      color: outputFormat === f.value ? colors.onAccent : colors.text,
                      fontSize: 13,
                      fontWeight: outputFormat === f.value ? 600 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {showQuality && (
              <div>
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
                  <span>Smaller</span>
                  <span>Better quality</span>
                </div>
              </div>
            )}

            {convertedSize !== null && originalSize > 0 && (
              <div
                className="tb-mono"
                style={{
                  background: colors.bgDeep,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  padding: '11px 14px',
                  fontSize: 12.5,
                  color: colors.text
                }}
              >
                {formatSize(originalSize)}
                <span style={{ color: colors.textFaint, margin: '0 10px' }}>→</span>
                {formatSize(convertedSize)}
                <span style={{ color: colors.textSecondary, marginLeft: 12 }}>
                  {convertedSize < originalSize
                    ? `−${(((originalSize - convertedSize) / originalSize) * 100).toFixed(1)}%`
                    : `+${(((convertedSize - originalSize) / originalSize) * 100).toFixed(1)}%`}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" icon={Zap} onClick={convertImage}>
                Convert
              </Button>
              {convertedBlob && (
                <Button variant="secondary" size="lg" icon={Download} onClick={handleDownload}>
                  Download
                </Button>
              )}
              <Button variant="ghost" size="lg" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
