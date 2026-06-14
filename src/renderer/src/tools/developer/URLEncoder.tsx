import { useState } from 'react';
import { Copy, Check, Link, ArrowDownUp, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function URLEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const colors = useThemeColors();

  const handleEncode = () => {
    try {
      setError('');
      setOutput(encodeURIComponent(input));
    } catch (e: any) {
      setError(e.message || 'Failed to encode');
      setOutput('');
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      setOutput(decodeURIComponent(input));
    } catch (e: any) {
      setError('Invalid URI: cannot decode');
      setOutput('');
    }
  };

  const handleEncodeAll = () => {
    try {
      setError('');
      setOutput(encodeURI(input));
    } catch (e: any) {
      setError(e.message || 'Failed to encode');
      setOutput('');
    }
  };

  const handleDecodeAll = () => {
    try {
      setError('');
      setOutput(decodeURI(input));
    } catch (e: any) {
      setError('Invalid URI: cannot decode');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
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
    fontSize: 15,
    fontFamily: 'monospace',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Link size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>URL Encoder/Decoder</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Encode and decode URLs and URI components with multiple modes
        </p>
      </div>

      <label style={{ fontSize: 15, fontWeight: 500, display: 'block', marginBottom: 10, color: colors.text }}>
        Input
      </label>
      <textarea
        style={textareaStyle}
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(''); }}
        placeholder="Enter text or URL to encode/decode..."
        spellCheck={false}
      />

      <div style={{ display: 'flex', gap: 12, margin: '20px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            background: colors.accent,
            color: colors.text,
          }}
          onClick={handleEncode}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Zap size={16} />
          Encode
        </button>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            background: colors.border,
            color: colors.textSecondary,
          }}
          onClick={handleDecode}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowDownUp size={16} />
          Decode
        </button>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            background: colors.accent,
            color: colors.text,
          }}
          onClick={handleEncodeAll}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Zap size={16} />
          Encode All
        </button>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            background: colors.border,
            color: colors.textSecondary,
          }}
          onClick={handleDecodeAll}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowDownUp size={16} />
          Decode All
        </button>
      </div>

      {error && (
        <div style={{ color: '#EF4444', fontSize: 15, marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {output && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
              Output
            </label>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: copied ? '#16A34A' : colors.border,
                color: copied ? '#22C55E' : colors.textSecondary,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onClick={handleCopy}
              disabled={!output}
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            style={textareaStyle}
            value={output}
            readOnly
            placeholder="Result will appear here..."
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
            <span>{input.length} chars in</span>
            <span style={{ color: colors.border }}>|</span>
            <span>{output.length} chars out</span>
            <span style={{ color: colors.border }}>|</span>
            <span>{output.length > input.length ? '+' : ''}{output.length - input.length} diff</span>
          </div>
        </div>
      )}
    </div>
  );
}
