import { useState, useRef, useCallback } from 'react'
import { Upload, Palette, Copy, Check } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

export function ColorPicker() {
  const [image, setImage] = useState<string | null>(null)
  const [pickedColor, setPickedColor] = useState<string | null>(null)
  const [pickedRgb, setPickedRgb] = useState<{ r: number; g: number; b: number } | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const colors = useThemeColors()

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.drawImage(img, 0, 0)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const rect = img.getBoundingClientRect()
    const scaleX = img.naturalWidth / rect.width
    const scaleY = img.naturalHeight / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = ctx.getImageData(x, y, 1, 1).data
    const r = data[0], g = data[1], b = data[2]
    const hex = rgbToHex(r, g, b)

    setPickedColor(hex)
    setPickedRgb({ r, g, b })
    setHistory((prev) => {
      const next = [hex, ...prev.filter((c) => c !== hex)].slice(0, 10)
      return next
    })
  }, [])

  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    })
  }, [])

  const rgbToHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const colorValues = pickedRgb
    ? (() => {
        const { r, g, b } = pickedRgb
        const hex = pickedColor!
        const hsl = rgbToHsl(r, g, b)
        return [
          { label: 'HEX', value: hex },
          { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
          { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }
        ]
      })()
    : []

  return (
    <div>
      <ToolHeader
        name="Color Picker"
        description="Pick colors from images with HEX, RGB, and HSL values."
        category="image"
        icon={Palette}
        serial="color-picker"
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) handleFile(file)
            }
            input.click()
          }}
          style={{
            border: `1px dashed ${isDragging ? colors.accent : colors.borderStrong}`,
            borderRadius: 'var(--tb-radius-panel)',
            background: isDragging ? colors.accentTint : colors.raised,
            padding: '56px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            cursor: 'pointer',
            transition:
              'border-color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease'
          }}
        >
          <Upload size={40} color={colors.textSecondary} />
          <span style={{ color: colors.textSecondary, fontSize: 15 }}>
            Drop an image here or click to browse
          </span>
        </div>
      ) : (
        <>
          <div className="tb-panel" style={{ padding: 20, marginBottom: 16, width: 'fit-content' }}>
            <img
              ref={imgRef}
              src={image}
              alt="Uploaded"
              onLoad={handleImageLoad}
              onClick={handleClick}
              style={{
                maxWidth: '100%',
                maxHeight: 440,
                display: 'block',
                borderRadius: 'var(--tb-radius-ctl)',
                cursor: 'crosshair'
              }}
            />
          </div>

          {pickedColor && (
            <div className="tb-panel" style={{ padding: 20, marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 'var(--tb-radius-panel)',
                  background: pickedColor,
                  border: `1px solid ${colors.borderStrong}`,
                  flexShrink: 0
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 240 }}>
                {colorValues.map((cv, i) => (
                  <button
                    key={cv.label}
                    onClick={() => copyToClipboard(cv.value, i)}
                    className="tb-hoverable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: colors.raised,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 'var(--tb-radius-ctl)',
                      padding: '11px 14px',
                      cursor: 'pointer',
                      color: colors.text,
                      fontFamily: 'inherit',
                      textAlign: 'left'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--tb-font-mono)',
                        fontSize: 10.5,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: colors.textFaint,
                        width: 44,
                        flexShrink: 0
                      }}
                    >
                      {cv.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--tb-font-mono)',
                        fontSize: 13.5,
                        flex: 1,
                        textAlign: 'left'
                      }}
                    >
                      {cv.value}
                    </span>
                    {copiedIndex === i ? (
                      <Check size={15} color={colors.success} />
                    ) : (
                      <Copy size={15} color={colors.textSecondary} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="tb-panel" style={{ padding: 20, marginBottom: 16 }}>
              <SectionLabel hint={`${history.length}`}>History</SectionLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {history.map((color, i) => (
                  <button
                    key={color + i}
                    onClick={() => copyToClipboard(color, 100 + i)}
                    title={color}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--tb-radius-ctl)',
                      background: color,
                      border: `1px solid ${colors.borderStrong}`,
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setImage(null)
              setPickedColor(null)
              setPickedRgb(null)
              setHistory([])
            }}
          >
            Clear Image
          </Button>
        </>
      )}
    </div>
  )
}
