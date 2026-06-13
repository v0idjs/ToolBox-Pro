import { useState, useEffect } from 'react';
import { Copy, Check, Clock, RefreshCw } from 'lucide-react';
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

  const styles: Record<string, React.CSSProperties> = {
    container: {
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    card: {
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      background: colors.input,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      color: colors.text,
      fontSize: '14px',
      marginBottom: '12px'
    },
    button: {
      padding: '12px 24px',
      background: colors.accent,
      border: 'none',
      borderRadius: '8px',
      color: colors.text,
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    timestamp: {
      fontSize: '18px',
      fontWeight: 700,
      fontFamily: 'monospace',
      marginBottom: '8px'
    },
    copyButton: {
      padding: '4px 8px',
      background: 'transparent',
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      color: colors.textSecondary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px'
    },
    resultContainer: {
      background: colors.input,
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px'
    },
    label: {
      color: colors.textSecondary,
      fontSize: '12px',
      marginBottom: '4px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    value: {
      color: colors.text,
      fontSize: '14px',
      fontFamily: 'monospace',
      wordBreak: 'break-all' as const
    }
  };

  const renderCopyButton = (value: string, field: string) => (
    <button
      style={styles.copyButton}
      onClick={() => copyToClipboard(value, field)}
    >
      {copiedField === field ? <Check size={12} /> : <Copy size={12} />}
      {copiedField === field ? 'Copied' : 'Copy'}
    </button>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <Clock size={28} />
        Timestamp Converter
      </h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Current Timestamp</h2>
        <div style={{ marginBottom: '12px' }}>
          <div style={styles.label}>UNIX (SECONDS)</div>
          <div style={styles.timestamp}>
            {currentSeconds}
            {renderCopyButton(String(currentSeconds), 'currentSec')}
          </div>
        </div>
        <div>
          <div style={styles.label}>UNIX (MILLISECONDS)</div>
          <div style={styles.timestamp}>
            {currentMilliseconds}
            {renderCopyButton(String(currentMilliseconds), 'currentMs')}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          <RefreshCw size={18} />
          Timestamp to Date
        </h2>
        <input
          style={styles.input}
          type="number"
          placeholder="Enter Unix timestamp (auto-detects seconds vs milliseconds)"
          value={timestampInput}
          onChange={(e) => setTimestampInput(e.target.value)}
        />
        <button style={styles.button} onClick={handleConvertTimestamp}>
          Convert
        </button>
        {convertedDate && (
          <div style={styles.resultContainer}>
            <div style={styles.label}>RESULTS</div>
            <pre style={{ ...styles.value, margin: 0, whiteSpace: 'pre-wrap' }}>
              {convertedDate}
            </pre>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Date to Timestamp</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. 2024-01-15 12:00:00"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <button style={styles.button} onClick={handleConvertDate}>
          Convert
        </button>
        {convertedTimestamp && (
          <div style={styles.resultContainer}>
            <div style={styles.label}>RESULTS</div>
            <pre style={{ ...styles.value, margin: 0, whiteSpace: 'pre-wrap' }}>
              {convertedTimestamp}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}