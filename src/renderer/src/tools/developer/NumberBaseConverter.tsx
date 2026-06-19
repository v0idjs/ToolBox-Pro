import React, { useState, useCallback, useEffect } from 'react';
import { Hash, ArrowUpDown } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

const PRESET_BASES = [
  { label: 'Binary', base: 2, prefix: '0b' },
  { label: 'Octal', base: 8, prefix: '0o' },
  { label: 'Decimal', base: 10, prefix: '' },
  { label: 'Hexadecimal', base: 16, prefix: '0x' },
];

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

  const inputStyle: React.CSSProperties = {
    background: colors.input,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    color: colors.text,
    fontSize: 15,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
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

  const formatInfoStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Hash size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Number Base Converter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Convert between binary, octal, decimal, hex, and custom bases in real time
        </p>
      </div>

      {error && (
        <div style={{
          background: '#DC262615', border: '1px solid #DC262640',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          color: '#EF4444', fontSize: 14, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {PRESET_BASES.map((preset) => (
          <div key={preset.base}>
            <div style={labelStyle}>
              <span>{preset.label}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: colors.accent }}>
                Base {preset.base}{preset.prefix ? ` (${preset.prefix})` : ''}
              </span>
            </div>
            <input
              type="text"
              value={inputs[preset.base]}
              onChange={(e) => handlePresetChange(preset.base, e.target.value)}
              style={{
                ...inputStyle,
                background: activeBase === preset.base ? colors.input : colors.input,
                borderColor: activeBase === preset.base ? colors.accent : colors.border,
              }}
              placeholder={preset.base === 10 ? '0' : preset.base === 16 ? 'FF' : preset.base === 8 ? '77' : '1010'}
            />
            <div style={formatInfoStyle}>
              <span>{inputs[preset.base] ? `${inputs[preset.base].length} chars` : ''}</span>
              {currentNum !== null && inputs[preset.base] && (
                <span>{currentNum.toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentNum !== null && (
        <div style={{
          background: colors.input, border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Parsed Value
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: colors.accent, fontFamily: 'monospace' }}>
            {currentNum.toLocaleString()}
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13, color: colors.textSecondary }}>
            <div>Bits: {currentNum === 0 ? 1 : Math.floor(Math.log2(Math.abs(currentNum))) + 1}</div>
            <div>Bytes: {Math.ceil((currentNum === 0 ? 1 : Math.floor(Math.log2(Math.abs(currentNum))) + 1) / 8)}</div>
            <div>Digits: {currentNum.toString().length}</div>
          </div>
        </div>
      )}

      <div style={{
        background: colors.input, border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ArrowUpDown size={18} color={colors.accent} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Custom Base</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Base (2-36)</div>
            <input
              type="number"
              min={2}
              max={36}
              value={customBase}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 2 && v <= 36) setCustomBase(v);
              }}
              style={{ ...inputStyle, textAlign: 'center' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Value (base {customBase})</div>
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              style={inputStyle}
              placeholder={`Enter value in base ${customBase}`}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Decimal equivalent</div>
            <input
              type="text"
              value={customResult}
              readOnly
              style={{ ...inputStyle, opacity: customResult ? 1 : 0.6 }}
              placeholder="Result in base 10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
