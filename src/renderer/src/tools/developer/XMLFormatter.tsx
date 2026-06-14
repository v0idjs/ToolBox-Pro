import { useState } from 'react';
import { Copy, Check, Code, Minimize2, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function XMLFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const colors = useThemeColors();

  const beautify = () => {
    try {
      let result = input;
      result = result.replace(/>\s*</g, '><');
      result = result.replace(/></g, '>\n<');
      let indent = 0;
      const lines = result.split('\n');
      const beautified = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        const padded = '  '.repeat(indent) + trimmed;
        if (
          trimmed.startsWith('<') &&
          !trimmed.startsWith('</') &&
          !trimmed.startsWith('<?') &&
          !trimmed.endsWith('/>') &&
          !/<[^/][^>]*\//.test(trimmed)
        ) {
          indent++;
        }
        return padded;
      });
      setOutput(beautified.filter((l) => l.trim()).join('\n'));
      setValidation(null);
    } catch {
      setValidation({ valid: false, message: 'Failed to beautify XML' });
    }
  };

  const minify = () => {
    try {
      const result = input.replace(/>\s+</g, '><').trim();
      setOutput(result);
      setValidation(null);
    } catch {
      setValidation({ valid: false, message: 'Failed to minify XML' });
    }
  };

  const validate = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'application/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        const msg = parseError.textContent || 'Invalid XML';
        setValidation({ valid: false, message: msg.substring(0, 200) });
      } else {
        setValidation({ valid: true, message: 'XML is well-formed' });
      }
    } catch {
      setValidation({ valid: false, message: 'Failed to parse XML' });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output || input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setValidation({ valid: false, message: 'Failed to copy to clipboard' });
    }
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 160,
    background: colors.input,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    color: colors.text,
    padding: 16,
    fontFamily: 'monospace',
    fontSize: 15,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Code size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>XML Formatter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Beautify, minify, and validate XML documents with syntax checking
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>
          Raw XML Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your XML here..."
          style={textareaStyle}
        />

        <div style={{ display: 'flex', gap: 12, margin: '20px 0', flexWrap: 'wrap' }}>
          <button
            onClick={beautify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 10,
              border: 'none',
              background: colors.accent,
              color: colors.text,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Zap size={16} />
            Beautify
          </button>
          <button
            onClick={minify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.border,
              color: colors.textSecondary,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Minimize2 size={16} />
            Minify
          </button>
          <button
            onClick={validate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.border,
              color: colors.textSecondary,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Validate
          </button>
        </div>

        {validation && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 15,
              background: validation.valid ? '#166534' : '#7F1D1D',
              color: colors.text,
            }}
          >
            {validation.valid ? '✓' : '✗'} {validation.message}
          </div>
        )}

        {output && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
                Output
              </label>
              <button
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: copied ? '#166534' : colors.border,
                  color: copied ? '#22C55E' : colors.textSecondary,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              style={{
                ...textareaStyle,
                minHeight: 200,
              }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 12,
              padding: '10px 0',
              borderTop: `1px solid ${colors.border}`,
              fontSize: 13,
              color: colors.textSecondary,
            }}>
              <span>{validation?.valid ? 'Well-formed XML' : validation?.message || 'No validation'}</span>
              <span style={{ color: colors.border }}>|</span>
              <span>{output.split('\n').length} lines</span>
              <span style={{ color: colors.border }}>|</span>
              <span>{output.length} chars</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
