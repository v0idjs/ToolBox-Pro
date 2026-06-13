import { useState } from 'react';
import { Copy, Check, Code, Minimize2 } from 'lucide-react';
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
    minHeight: '200px',
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    padding: '12px',
    fontFamily: 'monospace',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const buttonBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'opacity 0.2s',
  };

  return (
    <div style={{ color: colors.text }}>
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Code size={24} color={colors.accent} />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: colors.text }}>XML Formatter</h2>
        </div>

        <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontSize: '14px' }}>
          Raw XML Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your XML here..."
          style={textareaStyle}
        />

        <div style={{ display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap' }}>
          <button
            onClick={beautify}
            style={{ ...buttonBase, background: colors.accent, color: colors.text }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Code size={16} />
            Beautify
          </button>
          <button
            onClick={minify}
            style={{ ...buttonBase, background: colors.border, color: colors.text }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Minimize2 size={16} />
            Minify
          </button>
          <button
            onClick={validate}
            style={{ ...buttonBase, background: colors.border, color: colors.text }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Validate
          </button>
          <button
            onClick={copyToClipboard}
            style={{
              ...buttonBase,
              background: copied ? '#166534' : colors.border,
              color: colors.text,
              marginLeft: 'auto',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {validation && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '13px',
              background: validation.valid ? '#166534' : '#7F1D1D',
              color: colors.text,
            }}
          >
            {validation.valid ? '✓' : '✗'} {validation.message}
          </div>
        )}

        {output && (
          <>
            <label style={{ display: 'block', marginBottom: '8px', color: colors.textSecondary, fontSize: '14px' }}>
              Output
            </label>
            <textarea
              readOnly
              value={output}
              style={{
                ...textareaStyle,
                minHeight: '250px',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
