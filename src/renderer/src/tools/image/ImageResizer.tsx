import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Download, Maximize2, Link, Unlink, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Input, SectionLabel } from '@/components/ui'

const PRESETS = [25, 50, 75, 150, 200] as const

export function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [aspectLocked, setAspectLocked] = useState(true)
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null)
  const [estimatedSize, setEstimatedSize] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string>('')
  const colors = useThemeColors()

  const aspectRatio = originalWidth / originalHeight

  const loadImage = useCallback((file: File) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = URL.createObjectURL(file)
    previewUrlRef.current = url
    setPreviewUrl(url)
    setFileName(file.name)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setOriginalWidth(img.naturalWidth)
      setOriginalHeight(img.naturalHeight)
      setWidth(img.naturalWidth)
      setHeight(img.naturalHeight)
      setResizedBlob(null)
      setEstimatedSize('')
    }
    img.src = url
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      loadImage(file)
    },
    [loadImage]
  )

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

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setWidth(newWidth)
      if (aspectLocked && aspectRatio > 0) {
        setHeight(Math.round(newWidth / aspectRatio))
      }
    },
    [aspectLocked, aspectRatio]
  )

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      setHeight(newHeight)
      if (aspectLocked && aspectRatio > 0) {
        setWidth(Math.round(newHeight * aspectRatio))
      }
    },
    [aspectLocked, aspectRatio]
  )

  const applyPreset = useCallback(
    (percent: number) => {
      if (!image) return
      const w = Math.round(originalWidth * (percent / 100))
      const h = Math.round(originalHeight * (percent / 100))
      setWidth(w)
      setHeight(h)
    },
    [image, originalWidth, originalHeight]
  )

  const resizeImage = useCallback(() => {
    if (!image || width <= 0 || height <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(image, 0, 0, width, height)
    canvas.toBlob(
      (blob) => {
        setResizedBlob(blob)
        if (blob) {
          const kb = (blob.size / 1024).toFixed(1)
          const mb = (blob.size / (1024 * 1024)).toFixed(2)
          setEstimatedSize(blob.size > 1024 * 1024 ? `${mb} MB` : `${kb} KB`)
        }
      },
      'image/png',
      1
    )
  }, [image, width, height])

  const handleDownload = useCallback(() => {
    if (!resizedBlob) return
    const url = URL.createObjectURL(resizedBlob)
    const a = document.createElement('a')
    a.href = url
    const ext = fileName.split('.').pop() || 'png'
    const base = fileName.replace(/\.[^.]+$/, '')
    a.download = `${base}_${width}x${height}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [resizedBlob, fileName, width, height])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  return (
    <div>
      <ToolHeader
        name="Image Resizer"
        description="Resize images to specific dimensions or percentages."
        category="image"
        icon={Maximize2}
        serial="image-resizer"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
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
          padding: '56px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition:
            'border-color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease',
          marginBottom: 16
        }}
      >
        <Upload size={44} color={colors.textSecondary} style={{ marginBottom: 14 }} />
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Drag and drop an image here or click to browse
        </p>
      </div>

      {image && (
        <div className="tb-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px', minHeight: 140 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 280,
                  objectFit: 'contain',
                  borderRadius: 'var(--tb-radius-ctl)',
                  background: colors.bgDeep,
                  display: 'block'
                }}
              />
            </div>
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p
                className="tb-mono"
                style={{ fontSize: 12.5, color: colors.textSecondary, margin: 0, wordBreak: 'break-all' }}
              >
                {fileName}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    background: colors.bgDeep,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 'var(--tb-radius-ctl)',
                    padding: '10px 14px'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 10.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: colors.textFaint
                    }}
                  >
                    Original
                  </span>
                  <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--tb-font-display)' }}>
                    {originalWidth} × {originalHeight}
                  </div>
                </div>
                {resizedBlob && (
                  <div
                    style={{
                      flex: 1,
                      background: colors.bgDeep,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 'var(--tb-radius-ctl)',
                      padding: '10px 14px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--tb-font-mono)',
                        fontSize: 10.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: colors.textFaint
                      }}
                    >
                      New
                    </span>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: colors.accent,
                        fontFamily: 'var(--tb-font-display)'
                      }}
                    >
                      {width} × {height}
                    </div>
                  </div>
                )}
              </div>
              {estimatedSize && (
                <div
                  style={{
                    background: colors.bgDeep,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 'var(--tb-radius-ctl)',
                    padding: '10px 14px'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 10.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: colors.textFaint
                    }}
                  >
                    Estimated size
                  </span>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: colors.success,
                      fontFamily: 'var(--tb-font-display)'
                    }}
                  >
                    {estimatedSize}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12,
              marginBottom: 20,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: '1 1 160px' }}>
              <Input
                label="Width (px)"
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
              />
            </div>

            <button
              onClick={() => setAspectLocked(!aspectLocked)}
              title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              aria-label={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              style={{
                marginBottom: 1,
                background: aspectLocked ? colors.accentTint : colors.raised,
                border: `1px solid ${aspectLocked ? colors.accent : colors.borderStrong}`,
                borderRadius: 'var(--tb-radius-ctl)',
                padding: 9,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition:
                  'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease'
              }}
            >
              {aspectLocked ? (
                <Link size={16} color={colors.accent} />
              ) : (
                <Unlink size={16} color={colors.textSecondary} />
              )}
            </button>

            <div style={{ flex: '1 1 160px' }}>
              <Input
                label="Height (px)"
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Presets</SectionLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className="tb-hoverable"
                  style={{
                    background: colors.raised,
                    border: `1px solid ${colors.borderStrong}`,
                    borderRadius: 'var(--tb-radius-ctl)',
                    padding: '6px 14px',
                    color: colors.text,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" icon={Zap} onClick={resizeImage}>
              Resize
            </Button>
            {resizedBlob && (
              <Button variant="secondary" icon={Download} onClick={handleDownload}>
                Download
              </Button>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
