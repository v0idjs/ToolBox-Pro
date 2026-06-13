import { useState } from 'react';
import { Copy, Download, Trash2, FileText } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function RemoveDuplicates() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [stats, setStats] = useState<{ original: number; unique: number; removed: number } | null>(null);
  const colors = useThemeColors();

  const handleRemove = () => {
    let lines = input.split('\n');
    if (removeEmpty) {
      lines = lines.filter((l) => l.trim() !== '');
    }
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }
    const removed = lines.length - unique.length;
    setStats({ original: lines.length, unique: unique.length, removed });
    setOutput(unique.join('\n'));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // clipboard API may fail in Electron
    }
  };

  const handleSave = async () => {
    await window.api.saveFile('no-duplicates.txt', output);
  };

  const getSwitchBg = (active: boolean): React.CSSProperties => ({
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    backgroundColor: active ? colors.accent : colors.border,
    position: 'relative',
    transition: 'background-color 0.2s',
  });

  const getSwitchDot = (active: boolean): React.CSSProperties => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: colors.text,
    position: 'absolute',
    top: '3px',
    left: active ? '21px' : '3px',
    transition: 'left 0.2s',
  });

  return (
    <div style={{ color: colors.text, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={22} color={colors.accent} />
          Remove Duplicates
        </div>
        <div style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '24px' }}>Paste text and remove duplicate lines, keeping the first occurrence.</div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Input</div>
            <textarea
              style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, padding: '14px', fontSize: '13px', fontFamily: 'ui-monospace, monospace', resize: 'vertical' as const, width: '100%', minHeight: '220px', outline: 'none', boxSizing: 'border-box' as const }}
              placeholder="Paste your text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Output</div>
            <textarea
              style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, padding: '14px', fontSize: '13px', fontFamily: 'ui-monospace, monospace', resize: 'vertical' as const, width: '100%', minHeight: '220px', outline: 'none', boxSizing: 'border-box' as const }}
              value={output}
              readOnly
              placeholder="Result will appear here..."
              spellCheck={false}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                style={{ backgroundColor: 'transparent', color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: output ? 1 : 0.4 }}
                onClick={handleCopy}
                disabled={!output}
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                style={{ backgroundColor: 'transparent', color: colors.textSecondary, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: output ? 1 : 0.4 }}
                onClick={handleSave}
                disabled={!output}
              >
                <Download size={14} />
                Save to file
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' as const, fontSize: '14px', color: colors.textSecondary }}>
            <div style={getSwitchBg(caseSensitive)} onClick={() => setCaseSensitive(!caseSensitive)}>
              <div style={getSwitchDot(caseSensitive)} />
            </div>
            Case sensitive
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' as const, fontSize: '14px', color: colors.textSecondary }}>
            <div style={getSwitchBg(removeEmpty)} onClick={() => setRemoveEmpty(!removeEmpty)}>
              <div style={getSwitchDot(removeEmpty)} />
            </div>
            Remove empty lines
          </label>
          <button
            style={{ backgroundColor: colors.accent, color: colors.text, border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
            onClick={handleRemove}
            disabled={!input.trim()}
          >
            <Trash2 size={16} />
            Remove Duplicates
          </button>
        </div>

        {stats && (
          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
            <div style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '14px 20px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: colors.text }}>{stats.original}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', textTransform: 'uppercase' as const }}>Original</div>
            </div>
            <div style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '14px 20px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: colors.accent }}>{stats.unique}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', textTransform: 'uppercase' as const }}>Unique</div>
            </div>
            <div style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '14px 20px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#EF4444' }}>{stats.removed}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', textTransform: 'uppercase' as const }}>Removed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
