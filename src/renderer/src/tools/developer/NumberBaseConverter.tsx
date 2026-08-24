import { useState, useCallback, useEffect } from 'react'
import { Binary } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Card, SectionLabel, Input, StatStrip } from '@/components/ui'

const PRESET_BASES = [
  { label: 'Binary', base: 2, prefix: '0b' },
  { label: 'Octal', base: 8, prefix: '0o' },
  { label: 'Decimal', base: 10, prefix: '' },
  { label: 'Hexadecimal', base: 16, prefix: '0x' },
]

function parseInputValue(value: string, base: number): number | null {
  const cleaned = value.trim().replace(/^(0[bBoOxX])/, '');
  if (!cleaned) return null;
  const num = parseInt(cleaned, base);
  return isNaN(num) ? null : num;
}

function formatForBase(value: number, base: number, uppercase = false): string {
  let result = value.toString(base);
  if (uppercase) result = result.toUpperCase();
  return result;
}

function digitName(digit: string, base: number): string {
  const val = parseInt(digit, base);
  if (isNaN(val)) return '';
  if (base <= 10) return `digit ${val}`;
  if (val < 10) return `digit ${val}`;
  const names: Record<string, string> = { a: 'ten', b: 'eleven', c: 'twelve', d: 'thirteen', e: 'fourteen', f: 'fifteen' };
  return names[digit.toLowerCase()] || '';
}

function statItems(num: number): { value: string; label: string }[] {
  const bits = num === 0 ? 1 : Math.floor(Math.log2(Math.abs(num))) + 1;
  return [
    { value: String(bits), label: 'bits' },
    { value: String(Math.ceil(bits / 8)), label: 'bytes' },
    { value: String(num.toString().length), label: 'digits' },
  ];
}

export function NumberBaseConverter() {
  const [activeBase, setActiveBase] = useState(10);
  const [inputs, setInputs] = useState<Record<number, string>>({
    2: '',
    8: '',
    10: '',
    16: '',
  });
  const [customBase, setCustomBase] = useState(36);
  const [customValue, setCustomValue] = useState('');
  const [customResult, setCustomResult] = useState('');
  const [error, setError] = useState('');
  const colors = useThemeColors();

  const handlePresetChange = useCallback((base: number, value: string) => {
    setInputs((prev) => ({ ...prev, [base]: value }));
    setActiveBase(base);
    setError('');

    const num = parseInputValue(value, base);
    if (num === null && value.trim()) {
      setError(`Invalid ${base === 2 ? 'binary' : base === 8 ? 'octal' : base === 10 ? 'decimal' : 'hex'} input`);
      return;
    }

    if (num !== null) {
      const updated: Record<number, string> = {};
      for (const preset of PRESET_BASES) {
        updated[preset.base] = formatForBase(num, preset.base, base === 16);
      }
      setInputs(updated);
    }
  }, []);

  useEffect(() => {
    if (!customValue.trim()) {
      setCustomResult('');
      return;
    }
    const num = parseInputValue(customValue, customBase);
    if (num === null) {
      setCustomResult('Invalid input');
      return;
    }
    setCustomResult(formatForBase(num, 10));
  }, [customValue, customBase]);

  const currentNum = parseInputValue(inputs[activeBase], activeBase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Number Base Converter"
        description="Convert between binary, octal, decimal, hex, and custom bases in real time"
        category="developer"
        icon={Binary}
        serial="number-base-converter"
      />

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: `${colors.error}15`,
            border: `1px solid ${colors.error}40`,
            borderRadius: 'var(--tb-radius-ctl)',
            padding: '12px 16px',
            color: colors.error,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          {error}
        </div>
      )}

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionLabel>Preset Bases</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PRESET_BASES.map((preset) => {
            const active = activeBase === preset.base
            return (
              <div
                key={preset.base}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 12px',
                  borderRadius: 'var(--tb-radius-ctl)',
                  border: `1px solid ${active ? colors.accent : colors.border}`,
                  backgroundColor: active ? colors.accentTint : 'transparent',
                  transition: 'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease'
                }}
              >
                <span
                  style={{
                    width: 96,
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text
                  }}
                >
                  {preset.label}
                </span>
                <span
                  style={{
                    width: 68,
                    flexShrink: 0,
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    color: active ? colors.accent : colors.textFaint
                  }}
                >
                  base {preset.base}
                  {preset.prefix ? ` · ${preset.prefix}` : ''}
                </span>
                <input
                  type="text"
                  className="tb-field tb-mono"
                  value={inputs[preset.base]}
                  onChange={(e) => handlePresetChange(preset.base, e.target.value)}
                  spellCheck={false}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                  placeholder={
                    preset.base === 10 ? '0' : preset.base === 16 ? 'FF' : preset.base === 8 ? '77' : '1010'
                  }
                />
                <span
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.04em',
                    color: colors.textFaint,
                    lineHeight: 1.5
                  }}
                >
                  {inputs[preset.base] ? `${inputs[preset.base].length} chars` : ''}
                  {currentNum !== null && inputs[preset.base] && (
                    <span style={{ color: colors.textSecondary }}>{currentNum.toLocaleString()}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {currentNum !== null && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel>Parsed Value</SectionLabel>
          <div
            style={{
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
              color: colors.accent,
              wordBreak: 'break-all'
            }}
          >
            {currentNum.toLocaleString()}
          </div>
          <StatStrip items={statItems(currentNum)} />
        </Card>
      )}

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel>Custom Base</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 12 }}>
          <Input
            label="Base (2-36)"
            type="number"
            min={2}
            max={36}
            value={customBase}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 2 && v <= 36) setCustomBase(v);
            }}
            className="tb-field tb-mono"
            style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
            spellCheck={false}
          />
          <Input
            label={`Value (base ${customBase})`}
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="tb-field tb-mono"
            style={{ fontVariantNumeric: 'tabular-nums' }}
            placeholder={`Enter value in base ${customBase}`}
            spellCheck={false}
          />
          <Input
            label="Decimal equivalent"
            type="text"
            value={customResult}
            readOnly
            className="tb-field tb-mono"
            style={{ fontVariantNumeric: 'tabular-nums', opacity: customResult ? 1 : 0.6 }}
            placeholder="Result in base 10"
          />
        </div>
      </Card>
    </div>
  )
}
