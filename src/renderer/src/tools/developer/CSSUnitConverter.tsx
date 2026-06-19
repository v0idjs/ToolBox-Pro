import React, { useState, useCallback, useEffect } from 'react';
import { Ruler, Copy, Check } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface UnitState {
  px: string;
  rem: string;
  em: string;
  vw: string;
  percent: string;
}

const UNITS = ['px', 'rem', 'em', 'vw', '%'] as const;

function unitToKey(unit: string): keyof UnitState {
  return unit === '%' ? 'percent' : (unit as keyof UnitState);
}

function keyToUnit(key: keyof UnitState): string {
  return key === 'percent' ? '%' : key;
}

export function CSSUnitConverter() {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [activeUnit, setActiveUnit] = useState<string>('px');
  const [values, setValues] = useState<UnitState>({ px: '', rem: '', em: '', vw: '', percent: '' });
  const [copied, setCopied] = useState<string | null>(null);
  const colors = useThemeColors();

  const convertFromPx = useCallback((px: number): UnitState => {
    return {
      px: String(px),
      rem: baseFontSize ? (px / baseFontSize).toFixed(4).replace(/\.?0+$/, '') : '',
      em: baseFontSize ? (px / baseFontSize).toFixed(4).replace(/\.?0+$/, '') : '',
      vw: viewportWidth ? (px / viewportWidth * 100).toFixed(4).replace(/\.?0+$/, '') : '',
      percent: baseFontSize ? (px / baseFontSize * 100).toFixed(4).replace(/\.?0+$/, '') : '',
    };
  }, [baseFontSize, viewportWidth]);

  const convertToPx = useCallback((value: number, unit: string): number | null => {
    switch (unit) {
      case 'px': return value;
      case 'rem': return value * baseFontSize;
      case 'em': return value * baseFontSize;
      case 'vw': return value / 100 * viewportWidth;
      case '%': return value / 100 * baseFontSize;
      default: return null;
    }
  }, [baseFontSize, viewportWidth]);

  useEffect(() => {
    if (activeUnit) {
      const key = unitToKey(activeUnit);
      if (values[key]) {
        const num = parseFloat(values[key]);
        if (!isNaN(num)) {
          const px = convertToPx(num, activeUnit);
          if (px !== null) {
            const converted = convertFromPx(px);
            setValues((prev) => ({
              px: activeUnit === 'px' ? prev.px : converted.px,
              rem: activeUnit === 'rem' ? prev.rem : converted.rem,
              em: activeUnit === 'em' ? prev.em : converted.em,
              vw: activeUnit === 'vw' ? prev.vw : converted.vw,
              percent: activeUnit === '%' ? prev.percent : converted.percent,
            }));
          }
        }
      }
    }
  }, [activeUnit, baseFontSize, viewportWidth]);

  const handleChange = useCallback((unit: string, value: string) => {
    setActiveUnit(unit);
    const key = unitToKey(unit);
    setValues((prev) => ({ ...prev, [key]: value }));

    const num = parseFloat(value);
    if (isNaN(num)) {
      const empty = { px: '', rem: '', em: '', vw: '', percent: '' };
      setValues({ ...empty, [key]: value });
      return;
    }

    const px = convertToPx(num, unit);
    if (px !== null) {
      const converted = convertFromPx(px);
      setValues((prev) => ({
        px: unit === 'px' ? prev.px : converted.px,
        rem: unit === 'rem' ? prev.rem : converted.rem,
        em: unit === 'em' ? prev.em : converted.em,
        vw: unit === 'vw' ? prev.vw : converted.vw,
        percent: unit === '%' ? prev.percent : converted.percent,
      }));
    }
  }, [convertToPx, convertFromPx]);

  const handleCopy = useCallback(async (unit: string) => {
    const val = values[unitToKey(unit)];
    if (!val) return;
    try {
      await navigator.clipboard.writeText(`${val}${unit}`);
      setCopied(unit);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }, [values]);

  const quickValues = [12, 14, 16, 18, 20, 24, 32, 48, 64];

  const unitDescriptions: Record<string, string> = {
    px: 'Absolute pixels',
    rem: 'Relative to root font size',
    em: 'Relative to parent font size',
    vw: 'Relative to viewport width',
    '%': 'Relative to parent element',
  };

  const inputStyle: React.CSSProperties = {
    background: colors.input,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    color: colors.text,
    fontSize: 20,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  const unitLabelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Ruler size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>CSS Unit Converter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Convert px, rem, em, vw, and % with configurable base font size and viewport width
        </p>
      </div>

      <div style={{
        background: colors.input, border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: 20, marginBottom: 24,
        display: 'flex', gap: 24, alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Base Font Size</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min={1}
              value={baseFontSize}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v > 0) setBaseFontSize(v);
              }}
              style={{ ...inputStyle, padding: '10px 12px', fontSize: 15, width: 80, textAlign: 'center' }}
            />
            <span style={{ fontSize: 14, color: colors.textSecondary }}>px</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Viewport Width</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min={1}
              value={viewportWidth}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v > 0) setViewportWidth(v);
              }}
              style={{ ...inputStyle, padding: '10px 12px', fontSize: 15, width: 80, textAlign: 'center' }}
            />
            <span style={{ fontSize: 14, color: colors.textSecondary }}>px</span>
          </div>
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Quick Pick (px)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {quickValues.map((v) => (
              <button
                key={v}
                onClick={() => handleChange('px', String(v))}
                style={{
                  background: values.px === String(v) ? colors.accent : colors.bg,
                  color: values.px === String(v) ? '#fff' : colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {(['px', 'rem', 'em', 'vw', '%'] as const).map((unit) => {
          const isPrimary = unit === activeUnit;
          return (
            <div key={unit} style={{ gridColumn: unit === '%' ? '1 / 2' : undefined }}>
              <div style={unitLabelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: isPrimary ? colors.accent : colors.border,
                  }} />
                  {unit}
                </span>
                {values[unitToKey(unit)] && (
                  <button
                    onClick={() => handleCopy(unit)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: copied === unit ? '#22C55E' : colors.textSecondary,
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 600,
                    }}
                  >
                    {copied === unit ? <Check size={14} /> : <Copy size={14} />} Copy
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={values[unitToKey(unit)]}
                  onChange={(e) => handleChange(unit, e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: isPrimary ? colors.accent : colors.border,
                    paddingRight: 50,
                  }}
                  placeholder="0"
                />
                <span style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 14, fontWeight: 600, color: colors.textSecondary, pointerEvents: 'none',
                }}>
                  {unit}
                </span>
              </div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                {unitDescriptions[unit]}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: colors.input, border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Common Breakpoints
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 13 }}>
          {[
            { label: 'Mobile', px: 375 },
            { label: 'Tablet', px: 768 },
            { label: 'Laptop', px: 1024 },
            { label: 'Desktop', px: 1440 },
          ].map((bp) => (
            <div
              key={bp.label}
              style={{
                background: colors.bg, border: `1px solid ${colors.border}`,
                borderRadius: 8, padding: '10px 12px', textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 600, color: colors.text, marginBottom: 2 }}>{bp.label}</div>
              <div style={{ color: colors.textSecondary }}>{bp.px}px</div>
              <div style={{ color: colors.accent, fontFamily: 'monospace' }}>
                {(bp.px / baseFontSize).toFixed(2)}rem
              </div>
              <div style={{ color: colors.textSecondary, fontFamily: 'monospace', fontSize: 12 }}>
                {(bp.px / viewportWidth * 100).toFixed(1)}vw @{viewportWidth}px
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
