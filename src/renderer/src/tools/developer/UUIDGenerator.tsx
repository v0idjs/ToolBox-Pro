import { useState } from 'react';
import { Copy, Check, Hash, RefreshCw } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

const getStyles = (c: { bg: string; card: string; border: string; text: string; textSecondary: string; accent: string }) => ({
  container: {
    minHeight: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: c.text,
    margin: 0,
  } as React.CSSProperties,
  card: {
    backgroundColor: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: c.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '16px',
  } as React.CSSProperties,
  uuidDisplay: {
    fontSize: '18px',
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    color: c.text,
    backgroundColor: c.bg,
    border: `1px solid ${c.border}`,
    borderRadius: '8px',
    padding: '16px',
    wordBreak: 'break-all' as const,
    marginBottom: '16px',
  } as React.CSSProperties,
  buttonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    marginBottom: '16px',
  } as React.CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: c.accent,
    color: c.text,
  } as React.CSSProperties,
  secondaryButton: {
    backgroundColor: c.border,
    color: c.text,
    border: `1px solid ${c.border}`,
  } as React.CSSProperties,
  multiButton: (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive ? c.accent : c.border,
    color: c.text,
    border: isActive ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
    padding: '8px 14px',
  }),
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  } as React.CSSProperties,
  toggleLabel: {
    fontSize: '14px',
    color: c.textSecondary,
  } as React.CSSProperties,
  toggle: (isOn: boolean): React.CSSProperties => ({
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: isOn ? c.accent : c.border,
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    border: 'none',
  }),
  toggleDot: (isOn: boolean): React.CSSProperties => ({
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: c.text,
    position: 'absolute' as const,
    top: '3px',
    left: isOn ? '23px' : '3px',
    transition: 'left 0.2s ease',
  }),
  listContainer: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: c.bg,
    border: `1px solid ${c.border}`,
    borderRadius: '8px',
    marginBottom: '8px',
  } as React.CSSProperties,
  uuidText: {
    fontSize: '14px',
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    color: c.text,
    flex: 1,
    marginRight: '12px',
    wordBreak: 'break-all' as const,
  } as React.CSSProperties,
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: c.border,
    color: c.textSecondary,
    cursor: 'pointer',
    flexShrink: 0,
  } as React.CSSProperties,
  countBadge: {
    fontSize: '12px',
    color: c.textSecondary,
    marginLeft: 'auto',
  } as React.CSSProperties,
  copiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#22C55E',
    marginLeft: '8px',
  } as React.CSSProperties,
});

const QUANTITIES = [5, 10, 20, 50] as const;

export function UUIDGenerator() {
  const [currentUuid, setCurrentUuid] = useState('');
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const formatUuid = (uuid: string) => (uppercase ? uuid.toUpperCase() : uuid);

  const generateSingle = () => {
    setCurrentUuid(crypto.randomUUID());
    setUuidList([]);
    setQuantity(null);
  };

  const generateMultiple = (count: number) => {
    const uuids = Array.from({ length: count }, () => crypto.randomUUID());
    setUuidList(uuids);
    setCurrentUuid('');
    setQuantity(count);
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1500);
      }
    } catch {
      // Silently fail
    }
  };

  const copyAll = () => {
    const allUuids = uuidList.length > 0
      ? uuidList.map(formatUuid)
      : currentUuid ? [formatUuid(currentUuid)] : [];
    if (allUuids.length > 0) {
      copyToClipboard(allUuids.join('\n'));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Hash size={24} color={colors.accent} />
        <h1 style={styles.title}>UUID Generator</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Controls</div>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>Uppercase</span>
          <button
            style={styles.toggle(uppercase)}
            onClick={() => setUppercase((prev) => !prev)}
          >
            <span style={styles.toggleDot(uppercase)} />
          </button>
        </div>

        <div style={styles.buttonRow}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={generateSingle}
          >
            <RefreshCw size={16} />
            Generate UUID
          </button>
          {QUANTITIES.map((q) => (
            <button
              key={q}
              style={{ ...styles.button, ...styles.multiButton(quantity === q) }}
              onClick={() => generateMultiple(q)}
            >
              Generate {q}
            </button>
          ))}
        </div>
      </div>

      {currentUuid && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Generated UUID</div>
          <div style={styles.uuidDisplay}>{formatUuid(currentUuid)}</div>
          <div style={styles.buttonRow}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => copyToClipboard(formatUuid(currentUuid))}
            >
              {copiedAll ? <Check size={16} color="#22C55E" /> : <Copy size={16} />}
              {copiedAll ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {uuidList.length > 0 && (
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={styles.cardTitle}>Generated UUIDs</span>
            <span style={styles.countBadge}>{uuidList.length} items</span>
          </div>
          <div style={styles.listContainer}>
            {uuidList.map((uuid, index) => (
              <div key={index} style={styles.listItem}>
                <span style={styles.uuidText}>{formatUuid(uuid)}</span>
                <button
                  style={styles.copyButton}
                  onClick={() => copyToClipboard(formatUuid(uuid), index)}
                >
                  {copiedIndex === index ? (
                    <Check size={14} color="#22C55E" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', ...styles.buttonRow }}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={copyAll}
            >
              {copiedAll ? <Check size={16} color="#22C55E" /> : <Copy size={16} />}
              {copiedAll ? 'All Copied!' : `Copy All (${uuidList.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
