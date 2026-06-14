import { useState, useEffect } from 'react';
import { Copy, Check, Clock, RefreshCw, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function TimestampConverter() {
  const [currentSeconds, setCurrentSeconds] = useState(Math.floor(Date.now() / 1000));
  const [currentMilliseconds, setCurrentMilliseconds] = useState(Date.now());
  const [timestampInput, setTimestampInput] = useState('');
  const [convertedDate, setConvertedDate] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [convertedTimestamp, setConvertedTimestamp] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSeconds(Math.floor(Date.now() / 1000));
      setCurrentMilliseconds(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const handleConvertTimestamp = () => {
    if (!timestampInput) return;
    const value = Number(timestampInput);
    const timestamp = value > 1e12 ? value : value * 1000;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      setConvertedDate('Invalid timestamp');
      return;
    }
    setConvertedDate(JSON.stringify({
      iso8601: date.toISOString(),
      utc: date.toUTCString(),
      locale: date.toLocaleString(),
      relative: formatDate(date)
    }, null, 2));
  };

  const handleConvertDate = () => {
    if (!dateInput) return;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setConvertedTimestamp('Invalid date');
      return;
    }
    setConvertedTimestamp(JSON.stringify({
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime()
    }, null, 2));
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  };

  const cardTitle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 14,
    background: colors.input,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    color: colors.text,
    fontSize: 15,
    marginBottom: 16,
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '14px 28px',
    background: colors.accent,
    border: 'none',
    borderRadius: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: 'monospace',
    marginBottom: 8,
  };

  const copyButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    color: colors.textSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    marginLeft: 8,
    verticalAlign: 'middle',
  };

  const resultContainer: React.CSSProperties = {
    background: colors.bg,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    border: `1px solid ${colors.border}`,
  };

  const label: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontWeight: 600,
  };

  const value: React.CSSProperties = {
    color: colors.text,
    fontSize: 15,
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  };

  const renderCopyButton = (value: string, field: string) => (
    <button
      style={copyButtonStyle}
      onClick={() => copyToClipboard(value, field)}
    >
      {copiedField === field ? <Check size={12} /> : <Copy size={12} />}
      {copiedField === field ? 'Copied' : 'Copy'}
    </button>
  );

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Clock size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Timestamp Converter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Convert between Unix timestamps and human-readable dates
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitle}>Current Timestamp</h2>
        <div style={{ marginBottom: 16 }}>
          <div style={label}>UNIX (SECONDS)</div>
          <div style={timestampStyle}>
            {currentSeconds}
            {renderCopyButton(String(currentSeconds), 'currentSec')}
          </div>
        </div>
        <div>
          <div style={label}>UNIX (MILLISECONDS)</div>
          <div style={timestampStyle}>
            {currentMilliseconds}
            {renderCopyButton(String(currentMilliseconds), 'currentMs')}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${colors.border}`,
          fontSize: 13,
          color: colors.textSecondary,
        }}>
          <span>Live updating</span>
          <span style={{ color: colors.border }}>|</span>
          <span>Auto-refresh every 1s</span>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitle}>
          <RefreshCw size={16} />
          Timestamp to Date
        </h2>
        <input
          style={inputStyle}
          type="number"
          placeholder="Enter Unix timestamp (auto-detects seconds vs milliseconds)"
          value={timestampInput}
          onChange={(e) => setTimestampInput(e.target.value)}
        />
        <button style={buttonStyle} onClick={handleConvertTimestamp}>
          <Zap size={16} />
          Convert
        </button>
        {convertedDate && (
          <div style={resultContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={label}>RESULTS</div>
              <button
                style={{
                  ...copyButtonStyle,
                  margin: 0,
                }}
                onClick={() => copyToClipboard(convertedDate, 'tsToDate')}
              >
                {copiedField === 'tsToDate' ? <Check size={12} /> : <Copy size={12} />}
                {copiedField === 'tsToDate' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ ...value, margin: 0, whiteSpace: 'pre-wrap' }}>
              {convertedDate}
            </pre>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitle}>Date to Timestamp</h2>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. 2024-01-15 12:00:00"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <button style={buttonStyle} onClick={handleConvertDate}>
          <Zap size={16} />
          Convert
        </button>
        {convertedTimestamp && (
          <div style={resultContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={label}>RESULTS</div>
              <button
                style={{
                  ...copyButtonStyle,
                  margin: 0,
                }}
                onClick={() => copyToClipboard(convertedTimestamp, 'dateToTs')}
              >
                {copiedField === 'dateToTs' ? <Check size={12} /> : <Copy size={12} />}
                {copiedField === 'dateToTs' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ ...value, margin: 0, whiteSpace: 'pre-wrap' }}>
              {convertedTimestamp}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
