import { useState } from 'react';
import { Copy, Check, Hash, RefreshCw, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

const QUANTITIES = [5, 10, 20, 50] as const;

export function UUIDGenerator() {
  const [currentUuid, setCurrentUuid] = useState('');
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const colors = useThemeColors();

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

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  };

  const cardTitle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 16,
  };

  const buttonBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 28px',
    borderRadius: 10,
    border: 'none',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const toggleRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  };

  const toggleLabel: React.CSSProperties = {
    fontSize: 15,
    color: colors.textSecondary,
  };

  const toggle = (isOn: boolean): React.CSSProperties => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: isOn ? colors.accent : colors.border,
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    border: 'none',
  });

  const toggleDot = (isOn: boolean): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: colors.text,
    position: 'absolute' as const,
    top: 3,
    left: isOn ? 23 : 3,
    transition: 'left 0.2s ease',
  });

  const uuidDisplay: React.CSSProperties = {
    fontSize: 18,
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    color: colors.text,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 16,
    wordBreak: 'break-all' as const,
    marginBottom: 16,
  };

  const listContainer: React.CSSProperties = {
    maxHeight: 400,
    overflowY: 'auto' as const,
  };

  const listItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    marginBottom: 8,
  };

  const uuidText: React.CSSProperties = {
    fontSize: 15,
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    wordBreak: 'break-all' as const,
  };

  const copyButton: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    backgroundColor: colors.border,
    color: colors.textSecondary,
    cursor: 'pointer',
    flexShrink: 0,
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Hash size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>UUID Generator</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Generate v4 UUIDs in bulk with customizable format options
        </p>
      </div>

      <div style={cardStyle}>
        <div style={cardTitle}>Controls</div>
        <div style={toggleRow}>
          <span style={toggleLabel}>Uppercase</span>
          <button
            style={toggle(uppercase)}
            onClick={() => setUppercase((prev) => !prev)}
          >
            <span style={toggleDot(uppercase)} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            style={{ ...buttonBase, backgroundColor: colors.accent, color: colors.text }}
            onClick={generateSingle}
          >
            <Zap size={16} />
            Generate UUID
          </button>
          {QUANTITIES.map((q) => (
            <button
              key={q}
              style={{
                ...buttonBase,
                padding: '10px 20px',
                borderRadius: 8,
                backgroundColor: quantity === q ? colors.accent : colors.border,
                color: quantity === q ? colors.text : colors.textSecondary,
                border: quantity === q ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
              }}
              onClick={() => generateMultiple(q)}
            >
              Generate {q}
            </button>
          ))}
        </div>
      </div>

      {currentUuid && (
        <div style={cardStyle}>
          <div style={cardTitle}>Generated UUID</div>
          <div style={uuidDisplay}>{formatUuid(currentUuid)}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{ ...buttonBase, padding: '10px 20px', borderRadius: 8, backgroundColor: colors.border, color: colors.text, border: `1px solid ${colors.border}` }}
              onClick={() => copyToClipboard(formatUuid(currentUuid))}
            >
              {copiedAll ? <Check size={16} color="#22C55E" /> : <Copy size={16} />}
              {copiedAll ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {uuidList.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span style={cardTitle}>Generated UUIDs</span>
            <span style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 'auto' }}>{uuidList.length} items</span>
          </div>
          <div style={listContainer}>
            {uuidList.map((uuid, index) => (
              <div key={index} style={listItem}>
                <span style={uuidText}>{formatUuid(uuid)}</span>
                <button
                  style={copyButton}
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
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button
              style={{ ...buttonBase, padding: '10px 20px', borderRadius: 8, backgroundColor: colors.border, color: colors.text, border: `1px solid ${colors.border}` }}
              onClick={copyAll}
            >
              {copiedAll ? <Check size={16} color="#22C55E" /> : <Copy size={16} />}
              {copiedAll ? 'All Copied!' : `Copy All (${uuidList.length})`}
            </button>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            padding: '10px 0',
            borderTop: `1px solid ${colors.border}`,
            fontSize: 13,
            color: colors.textSecondary,
          }}>
            <span>{uuidList.length} UUIDs generated</span>
            <span style={{ color: colors.border }}>|</span>
            <span>Format: v4</span>
            <span style={{ color: colors.border }}>|</span>
            <span>{uppercase ? 'Uppercase' : 'Lowercase'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
