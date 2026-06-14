import React, { useState, useRef } from 'react';
import { BarChart3, Download, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

const CODE128B_ENCODING: Record<string, string> = {
  ' ': '11011001100',
  '!': '11001101100',
  '"': '11001100110',
  '#': '10010011000',
  '$': '10010001100',
  '%': '10001001100',
  '&': '10011001000',
  "'": '10011000100',
  '(': '10001100100',
  ')': '11001001000',
  '*': '11001000100',
  '+': '11000101000',
  ',': '11010001000',
  '-': '11000100100',
  '.': '11011001000',
  '/': '11011000100',
  '0': '11000110100',
  '1': '10010110000',
  '2': '10010001100',
  '3': '10001011000',
  '4': '10001000110',
  '5': '10110010000',
  '6': '10001101000',
  '7': '10110001000',
  '8': '10001100100',
  '9': '11001010000',
  ':': '11001000010',
  ';': '11000101000',
  '<': '11011011100',
  '=': '11011000110',
  '>': '11000110110',
  '?': '10100110000',
  '@': '10001011100',
  'A': '10001000110',
  'B': '10111000100',
  'C': '10001110100',
  'D': '10001110010',
  'E': '11100101000',
  'F': '11100100010',
  'G': '11100010100',
  'H': '11100010010',
  'I': '11100110100',
  'J': '11100110010',
  'K': '11011011000',
  'L': '11011000110',
  'M': '11000110110',
  'N': '10100011000',
  'O': '10001011100',
  'P': '10001000110',
  'Q': '10111001000',
  'R': '10111000100',
  'S': '10111000010',
  'T': '11100010010',
  'U': '11001110100',
  'V': '11001110010',
  'W': '11001011100',
  'X': '11001000110',
  'Y': '11000110110',
  'Z': '11011011000',
  '[': '11011000110',
  '\\': '11000110110',
  ']': '10100011000',
  '^': '10001011100',
  '_': '10001000110',
  '`': '10111010000',
  'a': '10111000100',
  'b': '10111000010',
  'c': '10001110100',
  'd': '10001110010',
  'e': '11100101000',
  'f': '11100100010',
  'g': '11100010100',
  'h': '11100010010',
  'i': '11011011000',
  'j': '11011000110',
  'k': '11000110110',
  'l': '10100011000',
  'm': '10001011100',
  'n': '10001000110',
  'o': '10111001000',
  'p': '10111000100',
  'q': '10111000010',
  'r': '11100010010',
  's': '11001110100',
  't': '11001110010',
  'u': '11001011100',
  'v': '11001000110',
  'w': '11000110110',
  'x': '11011011000',
  'y': '11011000110',
  'z': '11000110110',
  '{': '10100011000',
  '|': '10001011100',
  '}': '10001000110',
  '~': '10111010000',
  '\x7F': '10111000100',
};

const START_B = '104';
const STOP = '106';

const BAR_WIDTHS: Record<number, number> = {
  0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2,
  8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1,
  15: 2, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4, 21: 4,
  22: 4, 23: 4, 24: 2, 25: 4, 26: 4, 27: 4, 28: 4,
  29: 2, 30: 2, 31: 2, 32: 4, 33: 4, 34: 4, 35: 4,
  36: 4, 37: 4, 38: 2, 39: 4, 40: 4, 41: 4, 42: 4,
  43: 1, 44: 1, 45: 2, 46: 1, 47: 4, 48: 4, 49: 1,
  50: 4, 51: 4, 52: 1, 53: 2, 54: 2, 55: 1, 56: 2,
  57: 1, 58: 2, 59: 1, 60: 4, 61: 4, 62: 1, 63: 2,
  64: 2, 65: 2, 66: 2, 67: 2, 68: 2, 69: 2, 70: 2,
  71: 2, 72: 2, 73: 2, 74: 2, 75: 2, 76: 2, 77: 2,
  78: 2, 79: 2, 80: 2, 81: 2, 82: 2, 83: 2, 84: 2,
  85: 2, 86: 2, 87: 2, 88: 2, 89: 2, 90: 2, 91: 2,
  92: 2, 93: 2, 94: 2, 95: 2, 96: 2, 97: 2, 98: 2,
  99: 2, 100: 2, 101: 2, 102: 2, 103: 2, 104: 3, 105: 3,
  106: 4,
};

function getChecksum(text: string): number {
  let sum = 104;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    sum += code * (i + 1);
  }
  return sum % 103;
}

function encodeCode128B(text: string): string {
  const startCode = '104';
  const dataCode = text.split('').map((c) => {
    const code = c.charCodeAt(0) - 32;
    return code.toString();
  }).join(' ');
  const checksumVal = getChecksum(text);
  const checksum = checksumVal.toString();
  return `${startCode} ${dataCode} ${checksum} 106`;
}

function getCharWidths(charCode: number): number[] {
  const patterns: Record<number, number[]> = {
    0: [2,1,2,2,2,2],
    1: [2,2,2,1,2,2],
    2: [2,2,2,2,2,1],
    3: [1,2,1,2,2,3],
    4: [1,2,1,3,2,2],
    5: [1,3,1,2,2,2],
    6: [1,2,2,2,1,3],
    7: [1,2,2,3,1,2],
    8: [1,3,2,2,1,2],
    9: [2,2,1,2,1,3],
    10: [2,2,1,3,1,2],
    11: [2,3,1,2,1,2],
    12: [1,1,2,2,3,2],
    13: [1,2,2,1,3,2],
    14: [1,2,2,2,3,1],
    15: [1,1,3,2,2,2],
    16: [1,2,3,1,2,2],
    17: [1,2,3,2,2,1],
    18: [2,2,3,2,1,1],
    19: [2,2,1,1,3,2],
    20: [2,2,1,2,3,1],
    21: [2,1,3,2,1,2],
    22: [2,2,3,1,1,2],
    23: [3,1,2,1,3,1],
    24: [3,1,1,2,2,2],
    25: [3,2,1,1,2,2],
    26: [3,2,1,2,2,1],
    27: [3,1,2,2,1,2],
    28: [3,2,2,1,1,2],
    29: [3,2,2,2,1,1],
    30: [2,1,2,1,2,3],
    31: [2,1,2,3,2,1],
    32: [2,3,2,1,2,1],
    33: [1,1,1,3,2,3],
    34: [1,3,1,1,2,3],
    35: [1,3,1,3,2,1],
    36: [1,1,2,3,1,3],
    37: [1,3,2,1,1,3],
    38: [1,3,2,3,1,1],
    39: [2,1,1,3,1,3],
    40: [2,3,1,1,1,3],
    41: [2,3,1,3,1,1],
    42: [1,1,2,1,3,3],
    43: [1,1,2,3,3,1],
    44: [1,3,2,1,3,1],
    45: [1,1,3,1,2,3],
    46: [1,1,3,3,2,1],
    47: [1,3,3,1,2,1],
    48: [3,1,3,1,2,1],
    49: [2,1,1,3,3,1],
    50: [2,3,1,1,3,1],
    51: [2,1,3,1,1,3],
    52: [2,1,3,3,1,1],
    53: [2,1,3,1,3,1],
    54: [3,1,1,1,2,3],
    55: [3,1,1,3,2,1],
    56: [3,3,1,1,2,1],
    57: [3,1,2,1,1,3],
    58: [3,1,2,3,1,1],
    59: [3,3,2,1,1,1],
    60: [3,1,4,1,1,1],
    61: [2,2,1,4,1,1],
    62: [4,3,1,1,1,1],
    63: [1,1,1,2,2,4],
    64: [1,1,1,4,2,2],
    65: [1,2,1,1,2,4],
    66: [1,2,1,4,2,1],
    67: [1,4,1,1,2,2],
    68: [1,4,1,2,2,1],
    69: [1,1,2,2,1,4],
    70: [1,1,2,4,1,2],
    71: [1,2,2,1,1,4],
    72: [1,2,2,4,1,1],
    73: [1,4,2,1,1,2],
    74: [1,4,2,2,1,1],
    75: [2,4,1,2,1,1],
    76: [2,2,1,1,1,4],
    77: [4,1,3,1,1,1],
    78: [2,4,1,1,1,2],
    79: [1,3,4,1,1,1],
    80: [1,1,1,2,4,2],
    81: [1,2,1,1,4,2],
    82: [1,2,1,2,4,1],
    83: [1,1,4,2,1,2],
    84: [1,2,4,1,1,2],
    85: [1,2,4,2,1,1],
    86: [4,1,1,2,1,2],
    87: [4,2,1,1,1,2],
    88: [4,2,1,2,1,1],
    89: [2,1,2,1,4,1],
    90: [2,1,4,1,2,1],
    91: [4,1,2,1,2,1],
    92: [1,1,1,1,4,3],
    93: [1,1,1,3,4,1],
    94: [1,3,1,1,4,1],
    95: [1,1,4,1,1,3],
    96: [1,1,4,3,1,1],
    97: [4,1,1,1,1,3],
    98: [4,1,1,3,1,1],
    99: [1,1,3,1,4,1],
    100: [1,1,4,1,3,1],
    101: [3,1,1,1,4,1],
    102: [4,1,1,1,3,1],
    103: [2,1,1,4,1,2],
    104: [2,1,1,2,1,4],
    105: [2,1,1,2,3,2],
    106: [2,3,3,1,1,1],
  };
  return patterns[charCode] || [2,1,2,2,2,2];
}

function drawBarcode(canvas: HTMLCanvasElement, text: string, multiplier: number) {
  const ctx = canvas.getContext('2d')!;
  const encoded = encodeCode128B(text);
  const codes = encoded.split(' ').map(Number);

  const barHeight = 80 * multiplier;
  const lineWidth = 1 * multiplier;

  let totalUnits = 0;
  for (const code of codes) {
    const widths = getCharWidths(code);
    totalUnits += widths.reduce((a, b) => a + b, 0);
  }

  const quietZone = 10 * lineWidth;
  canvas.width = totalUnits * lineWidth + quietZone * 2;
  canvas.height = barHeight + 40 * multiplier;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  ctx.font = `${12 * multiplier}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, canvas.height - 10 * multiplier);

  let x = quietZone;
  for (const code of codes) {
    const widths = getCharWidths(code);
    for (let i = 0; i < widths.length; i++) {
      if (i % 2 === 0) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, 10 * multiplier, widths[i] * lineWidth, barHeight - 20 * multiplier);
      }
      x += widths[i] * lineWidth;
    }
  }
}

export function BarcodeGenerator() {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('CODE128');
  const [multiplier, setMultiplier] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const c = useThemeColors();

  const handleGenerate = () => {
    if (!content || !canvasRef.current) return;
    drawBarcode(canvasRef.current, content, multiplier);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `barcode-${content}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const labelStyle: React.CSSProperties = {
    color: c.textSecondary,
    fontSize: '15px',
    fontWeight: '500',
    display: 'block',
    marginBottom: '10px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    backgroundColor: c.input,
    border: `1px solid ${c.border}`,
    borderRadius: '10px',
    color: c.text,
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <BarChart3 size={28} color={c.accent} />
        <div>
          <h1 style={{ color: c.text, fontSize: '28px', fontWeight: '700', margin: 0 }}>
            Barcode Generator
          </h1>
          <p style={{ color: c.textSecondary, fontSize: '15px', margin: 0, marginTop: '4px' }}>
            Generate barcodes in various formats
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>
          Content
        </label>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter text or numbers"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>
          Format
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          style={{
            ...inputStyle,
            cursor: 'pointer',
          }}
        >
          <option value="CODE128">CODE128</option>
          <option value="CODE39">CODE39</option>
          <option value="EAN-13">EAN-13</option>
        </select>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>
            Size Multiplier
          </label>
          <span style={{ color: c.text, fontSize: '14px', fontFamily: 'monospace' }}>
            {multiplier}x
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: c.accent,
            height: '4px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ color: c.textSecondary, fontSize: '13px' }}>1x</span>
          <span style={{ color: c.textSecondary, fontSize: '13px' }}>4x</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={handleGenerate}
          style={{
            flex: 1,
            padding: '14px 28px',
            backgroundColor: c.accent,
            color: c.text,
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Zap size={18} />
          Generate
        </button>
        <button
          onClick={handleDownload}
          disabled={!content}
          style={{
            padding: '14px 28px',
            backgroundColor: 'transparent',
            color: content ? c.text : c.textSecondary,
            border: `1px solid ${c.border}`,
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: content ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'opacity 0.2s',
          }}
        >
          <Download size={18} />
          Download
        </button>
      </div>

      <div style={{
        backgroundColor: c.input,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '180px',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
}