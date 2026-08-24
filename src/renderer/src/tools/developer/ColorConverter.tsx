import { useState, useCallback } from 'react'
import { Copy, Check, Palette } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r: number
  let g: number
  let b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function ColorConverter() {
  const [hex, setHex] = useState('#2563EB')
  const [rgb, setRgb] = useState({ r: 37, g: 99, b: 235 })
  const [hsl, setHsl] = useState({ h: 224, s: 84, l: 53 })
  const [copied, setCopied] = useState<string | null>(null)
  const colors = useThemeColors()

  const handleHexChange = useCallback((value: string) => {
    let clean = value.replace(/[^a-fA-F0-9]/g, '')
    if (clean.length > 6) clean = clean.slice(0, 6)
    const hex = clean.length > 0 ? '#' + clean : ''
    setHex(hex)
    if (hex.length === 7) {
      const parsed = hexToRgb(hex)
      if (parsed) {
        setRgb(parsed)
        setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b))
      }
    }
  }, [])

  const handleRgbChange = useCallback(
    (component: 'r' | 'g' | 'b', value: string) => {
      const num = parseInt(value, 10)
      if (isNaN(num)) return
      const clamped = Math.max(0, Math.min(255, num))
      const newRgb = { ...rgb, [component]: clamped }
      setRgb(newRgb)
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
    },
    [rgb]
  )

  const handleHslChange = useCallback(
    (component: 'h' | 's' | 'l', value: string) => {
      const num = parseInt(value, 10)
      if (isNaN(num)) return
      const max = component === 'h' ? 360 : 100
      const clamped = Math.max(0, Math.min(max, num))
      const newHsl = { ...hsl, [component]: clamped }
      setHsl(newHsl)
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
      setRgb(newRgb)
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    },
    [hsl]
  )

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }, [])

  const isComplete = hex.length === 7

  const swatchStyle = {
    width: 14,
    height: 14,
    flexShrink: 0,
    borderRadius: 'var(--tb-radius-ctl)',
    border: '1px solid var(--tb-border-strong)',
    backgroundColor: isComplete ? hex : 'transparent'
  } as const

  const renderValueChip = (value: string, label: string, title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span aria-hidden style={swatchStyle} />
      <span
        className="tb-mono"
        style={{
          flex: 1,
          fontSize: 12.5,
          padding: '7px 10px',
          backgroundColor: colors.bgDeep,
          border: `1px solid ${colors.border}`,
          borderRadius: 'var(--tb-radius-ctl)',
          color: colors.text
        }}
      >
        {value || '—'}
      </span>
      <Button
        variant="ghost"
        size="sm"
        icon={copied === label ? Check : Copy}
        onClick={() => handleCopy(value, label)}
        title={title}
        style={copied === label ? { color: colors.success } : undefined}
      >
        {copied === label ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Color Converter"
        description="Convert between HEX, RGB, and HSL color formats with live preview"
        category="developer"
        icon={Palette}
        serial="color-converter"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <SectionLabel>HEX</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                className="tb-field tb-mono"
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                maxLength={7}
              />
              {renderValueChip(hex, 'hex', 'Copy HEX')}
            </div>
          </Card>

          <Card>
            <SectionLabel>RGB</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['r', 'g', 'b'] as const).map((component) => (
                  <div key={component} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span
                      className="tb-mono"
                      style={{ fontSize: 12, color: colors.textSecondary, width: 16, textAlign: 'center' }}
                    >
                      {component.toUpperCase()}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb[component]}
                      onChange={(e) => handleRgbChange(component, e.target.value)}
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
              {renderValueChip(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb', 'Copy RGB')}
            </div>
          </Card>

          <Card>
            <SectionLabel>HSL</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['h', 's', 'l'] as const).map((component) => (
                  <div key={component} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span
                      className="tb-mono"
                      style={{ fontSize: 12, color: colors.textSecondary, width: 16, textAlign: 'center' }}
                    >
                      {component.toUpperCase()}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={component === 'h' ? 360 : 100}
                      value={hsl[component]}
                      onChange={(e) => handleHslChange(component, e.target.value)}
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
              {renderValueChip(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl', 'Copy HSL')}
            </div>
          </Card>
        </div>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel>Preview</SectionLabel>
          <div
            style={{
              minHeight: 160,
              flex: 1,
              borderRadius: 'var(--tb-radius-panel)',
              border: `1px solid ${colors.borderStrong}`,
              backgroundColor: isComplete ? hex : colors.raised,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color var(--tb-speed) ease'
            }}
          >
            {!isComplete && <Palette size={24} color={colors.textSecondary} />}
          </div>
        </Card>
      </div>
    </div>
  )
}
