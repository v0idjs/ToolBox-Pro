import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, Ruler } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

interface UnitState {
  px: string
  rem: string
  em: string
  vw: string
  percent: string
}

const UNITS = ['px', 'rem', 'em', 'vw', '%'] as const

function unitToKey(unit: string): keyof UnitState {
  return unit === '%' ? 'percent' : (unit as keyof UnitState)
}

export function CSSUnitConverter() {
  const [baseFontSize, setBaseFontSize] = useState(16)
  const [viewportWidth, setViewportWidth] = useState(1440)
  const [activeUnit, setActiveUnit] = useState<string>('px')
  const [values, setValues] = useState<UnitState>({ px: '', rem: '', em: '', vw: '', percent: '' })
  const [copied, setCopied] = useState<string | null>(null)
  const colors = useThemeColors()

  const convertFromPx = useCallback(
    (px: number): UnitState => {
      return {
        px: String(px),
        rem: baseFontSize ? (px / baseFontSize).toFixed(4).replace(/\.?0+$/, '') : '',
        em: baseFontSize ? (px / baseFontSize).toFixed(4).replace(/\.?0+$/, '') : '',
        vw: viewportWidth ? (px / viewportWidth * 100).toFixed(4).replace(/\.?0+$/, '') : '',
        percent: baseFontSize ? (px / baseFontSize * 100).toFixed(4).replace(/\.?0+$/, '') : ''
      }
    },
    [baseFontSize, viewportWidth]
  )

  const convertToPx = useCallback(
    (value: number, unit: string): number | null => {
      switch (unit) {
        case 'px':
          return value
        case 'rem':
          return value * baseFontSize
        case 'em':
          return value * baseFontSize
        case 'vw':
          return value / 100 * viewportWidth
        case '%':
          return value / 100 * baseFontSize
        default:
          return null
      }
    },
    [baseFontSize, viewportWidth]
  )

  useEffect(() => {
    if (activeUnit) {
      const key = unitToKey(activeUnit)
      if (values[key]) {
        const num = parseFloat(values[key])
        if (!isNaN(num)) {
          const px = convertToPx(num, activeUnit)
          if (px !== null) {
            const converted = convertFromPx(px)
            setValues((prev) => ({
              px: activeUnit === 'px' ? prev.px : converted.px,
              rem: activeUnit === 'rem' ? prev.rem : converted.rem,
              em: activeUnit === 'em' ? prev.em : converted.em,
              vw: activeUnit === 'vw' ? prev.vw : converted.vw,
              percent: activeUnit === '%' ? prev.percent : converted.percent
            }))
          }
        }
      }
    }
  }, [activeUnit, baseFontSize, viewportWidth])

  const handleChange = useCallback(
    (unit: string, value: string) => {
      setActiveUnit(unit)
      const key = unitToKey(unit)
      setValues((prev) => ({ ...prev, [key]: value }))

      const num = parseFloat(value)
      if (isNaN(num)) {
        const empty = { px: '', rem: '', em: '', vw: '', percent: '' }
        setValues({ ...empty, [key]: value })
        return
      }

      const px = convertToPx(num, unit)
      if (px !== null) {
        const converted = convertFromPx(px)
        setValues((prev) => ({
          px: unit === 'px' ? prev.px : converted.px,
          rem: unit === 'rem' ? prev.rem : converted.rem,
          em: unit === 'em' ? prev.em : converted.em,
          vw: unit === 'vw' ? prev.vw : converted.vw,
          percent: unit === '%' ? prev.percent : converted.percent
        }))
      }
    },
    [convertToPx, convertFromPx]
  )

  const handleCopy = useCallback(
    async (unit: string) => {
      const val = values[unitToKey(unit)]
      if (!val) return
      try {
        await navigator.clipboard.writeText(`${val}${unit}`)
        setCopied(unit)
        setTimeout(() => setCopied(null), 1500)
      } catch {}
    },
    [values]
  )

  const quickValues = [12, 14, 16, 18, 20, 24, 32, 48, 64]

  const unitDescriptions: Record<string, string> = {
    px: 'Absolute pixels',
    rem: 'Relative to root font size',
    em: 'Relative to parent font size',
    vw: 'Relative to viewport width',
    '%': 'Relative to parent element'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="CSS Unit Converter"
        description="Convert px, rem, em, vw, and % with configurable base font size and viewport width"
        category="developer"
        icon={Ruler}
        serial="css-unit-converter"
      />

      <Card>
        <SectionLabel hint={`source ${activeUnit}`}>Configuration</SectionLabel>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <SectionLabel>Base font size</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Input
                type="number"
                min={1}
                value={baseFontSize}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v) && v > 0) setBaseFontSize(v)
                }}
                className="tb-field"
                style={{ width: 84, textAlign: 'center' }}
              />
              <span style={{ fontSize: 13, color: colors.textSecondary }}>px</span>
            </div>
          </div>
          <div>
            <SectionLabel>Viewport width</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Input
                type="number"
                min={1}
                value={viewportWidth}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v) && v > 0) setViewportWidth(v)
                }}
                className="tb-field"
                style={{ width: 84, textAlign: 'center' }}
              />
              <span style={{ fontSize: 13, color: colors.textSecondary }}>px</span>
            </div>
          </div>
          <div style={{ flex: 2, minWidth: 220 }}>
            <SectionLabel>Quick pick (px)</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {quickValues.map((v) => (
                <Button
                  key={v}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleChange('px', String(v))}
                  style={
                    values.px === String(v)
                      ? { backgroundColor: colors.accent, color: colors.onAccent, borderColor: colors.accent }
                      : undefined
                  }
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel hint={`editing ${activeUnit}`}>Units</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {UNITS.map((unit) => {
            const isPrimary = unit === activeUnit
            return (
              <div key={unit} style={unit === '%' ? { gridColumn: '1 / 2' } : undefined}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isPrimary ? colors.accent : colors.textSecondary
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: isPrimary ? colors.accent : colors.border
                      }}
                    />
                    {unit}
                  </span>
                  {values[unitToKey(unit)] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={copied === unit ? Check : Copy}
                      onClick={() => handleCopy(unit)}
                      style={copied === unit ? { color: colors.success } : undefined}
                    >
                      {copied === unit ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Input
                    type="text"
                    value={values[unitToKey(unit)]}
                    onChange={(e) => handleChange(unit, e.target.value)}
                    placeholder="0"
                    className="tb-field tb-mono"
                    style={{
                      paddingRight: 44,
                      borderColor: isPrimary ? colors.accent : undefined
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.textSecondary,
                      pointerEvents: 'none'
                    }}
                  >
                    {unit}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 4 }}>{unitDescriptions[unit]}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <SectionLabel hint={`${baseFontSize}px base · ${viewportWidth}px viewport`}>
          Common breakpoints
        </SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Mobile', px: 375 },
            { label: 'Tablet', px: 768 },
            { label: 'Laptop', px: 1024 },
            { label: 'Desktop', px: 1440 }
          ].map((bp) => (
            <div
              key={bp.label}
              style={{
                backgroundColor: colors.bgDeep,
                border: `1px solid ${colors.border}`,
                borderRadius: 'var(--tb-radius-ctl)',
                padding: '10px 12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: colors.text, marginBottom: 2 }}>{bp.label}</div>
              <div style={{ fontFamily: 'var(--tb-font-mono)', fontSize: 12, color: colors.textSecondary }}>
                {bp.px}px
              </div>
              <div
                style={{
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 13,
                  color: colors.accent
                }}
              >
                {(bp.px / baseFontSize).toFixed(2)}rem
              </div>
              <div
                style={{
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 11,
                  color: colors.textSecondary
                }}
              >
                {(bp.px / viewportWidth * 100).toFixed(1)}vw @{viewportWidth}px
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
