import { useState } from 'react';
import { Copy, Check, Link, ArrowDownUp } from 'lucide-react';
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
    minHeight: '120px',
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: colors.accent,
    color: colors.text,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: colors.border,
    color: colors.textSecondary,
  };

  const copyButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: copied ? '#16A34A' : colors.border,
    color: colors.text,
    position: 'absolute',
    top: '12px',
    right: '12px',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Link size={20} color={colors.accent} />
        <h2 style={{ color: colors.text, fontSize: '18px', fontWeight: 600, margin: 0 }}>URL Encoder / Decoder</h2>
      </div>

      <label style={{ color: colors.textSecondary, fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
        Input
      </label>
      <textarea
        style={textareaStyle}
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(''); }}
        placeholder="Enter text or URL to encode/decode..."
        spellCheck={false}
      />

      <div style={{ display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          style={primaryButtonStyle}
          onClick={handleEncode}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowDownUp size={14} />
          Encode
        </button>
        <button
          style={secondaryButtonStyle}
          onClick={handleDecode}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowDownUp size={14} />
          Decode
        </button>
        <button
          style={primaryButtonStyle}
          onClick={handleEncodeAll}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowDownUp size={14} />
          Encode All
        </button>
        <button
          style={secondaryButtonStyle}
          onClick={handleDecodeAll}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <ArrowDownUp size={14} />
          Decode All
        </button>
      </div>

      {error && (
        <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '12px', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <label style={{ color: colors.textSecondary, fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
          Output
        </label>
        <textarea
          style={textareaStyle}
          value={output}
          readOnly
          placeholder="Result will appear here..."
        />
        <button
          style={copyButtonStyle}
          onClick={handleCopy}
          disabled={!output}
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
