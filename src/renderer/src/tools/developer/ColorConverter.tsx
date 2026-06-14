import React, { useState, useCallback } from 'react';
import { Copy, Check, Palette } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function ColorConverter() {
  const [hex, setHex] = useState('#2563EB');
  const [rgb, setRgb] = useState({ r: 37, g: 99, b: 235 });
  const [hsl, setHsl] = useState({ h: 224, s: 84, l: 53 });
  const [copied, setCopied] = useState<string | null>(null);
  const colors = useThemeColors();

  const handleHexChange = useCallback((value: string) => {
    let clean = value.replace(/[^a-fA-F0-9]/g, '');
    if (clean.length > 6) clean = clean.slice(0, 6);
    const hex = clean.length > 0 ? '#' + clean : '';
    setHex(hex);
    if (hex.length === 7) {
      const parsed = hexToRgb(hex);
      if (parsed) {
        setRgb(parsed);
        setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b));
      }
    }
  }, []);

  const handleRgbChange = useCallback(
    (component: 'r' | 'g' | 'b', value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      const clamped = Math.max(0, Math.min(255, num));
      const newRgb = { ...rgb, [component]: clamped };
      setRgb(newRgb);
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    },
    [rgb]
  );

  const handleHslChange = useCallback(
    (component: 'h' | 's' | 'l', value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      const max = component === 'h' ? 360 : 100;
      const clamped = Math.max(0, Math.min(max, num));
      const newHsl = { ...hsl, [component]: clamped };
      setHsl(newHsl);
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      setRgb(newRgb);
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [hsl]
  );

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard write failed
    }
  }, []);

  const sectionHeaderStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const inputStyle: React.CSSProperties = {
    background: colors.border,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    color: colors.text,
    fontSize: 15,
    fontFamily: 'monospace',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'monospace',
    minWidth: 20,
    textAlign: 'right' as const,
  };

  const copyButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary,
    transition: 'all 0.2s',
  };

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  };

  const previewStyle: React.CSSProperties = {
    width: 100,
    height: 100,
    borderRadius: 16,
    background: hex.length === 7 ? hex : colors.text,
    border: `2px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Palette size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Color Converter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Convert between HEX, RGB, and HSL color formats with live preview
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {/* HEX Section */}
            <div style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={sectionHeaderStyle}>
                <span>HEX</span>
              </div>
              <div style={inputGroupStyle}>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  style={inputStyle}
                  placeholder="#000000"
                  maxLength={7}
                />
                <button
                  onClick={() => handleCopy(hex, 'hex')}
                  style={{
                    ...copyButtonStyle,
                    ...(copied === 'hex'
                      ? { color: '#22C55E', borderColor: '#22C55E' }
                      : {}),
                  }}
                  title="Copy HEX"
                >
                  {copied === 'hex' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* RGB Section */}
            <div style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={sectionHeaderStyle}>
                <span>RGB</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                {(['r', 'g', 'b'] as const).map((component) => (
                  <div
                    key={component}
                    style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  >
                    <span style={labelStyle}>
                      {component.toUpperCase()}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb[component]}
                      onChange={(e) =>
                        handleRgbChange(component, e.target.value)
                      }
                      style={{
                        ...inputStyle,
                        marginLeft: 6,
                        textAlign: 'center',
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    handleCopy(
                      `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                      'rgb'
                    )
                  }
                  style={{
                    ...copyButtonStyle,
                    ...(copied === 'rgb'
                      ? { color: '#22C55E', borderColor: '#22C55E' }
                      : {}),
                  }}
                  title="Copy RGB"
                >
                  {copied === 'rgb' ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* HSL Section */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <span>HSL</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                {(['h', 's', 'l'] as const).map((component) => (
                  <div
                    key={component}
                    style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  >
                    <span style={labelStyle}>
                      {component.toUpperCase()}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={component === 'h' ? 360 : 100}
                      value={hsl[component]}
                      onChange={(e) =>
                        handleHslChange(component, e.target.value)
                      }
                      style={{
                        ...inputStyle,
                        marginLeft: 6,
                        textAlign: 'center',
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    handleCopy(
                      `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                      'hsl'
                    )
                  }
                  style={{
                    ...copyButtonStyle,
                    ...(copied === 'hsl'
                      ? { color: '#22C55E', borderColor: '#22C55E' }
                      : {}),
                  }}
                  title="Copy HSL"
                >
                  {copied === 'hsl' ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div style={{ paddingTop: 24 }}>
            <div style={previewStyle}>
              {hex.length < 7 && (
                <Palette size={24} color={colors.textSecondary} />
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 16,
              padding: '10px 0',
              borderTop: `1px solid ${colors.border}`,
              fontSize: 13,
              color: colors.textSecondary,
            }}>
              <span>{hex}</span>
              <span style={{ color: colors.border }}>|</span>
              <span>rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
