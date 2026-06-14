import { useState } from 'react';
import { FileText, Zap, Copy, Download } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function RemoveDuplicates() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [stats, setStats] = useState<{ original: number; unique: number; removed: number } | null>(null);
  const [copied, setCopied] = useState(false);
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
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSave = async () => {
    await window.api.saveFile('no-duplicates.txt', output);
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <FileText size={28} color={colors.accent} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Remove Duplicates</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, marginBottom: 32 }}>
        Paste text and remove duplicate lines, keeping the first occurrence
      </p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>Input</label>
          <textarea
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              color: colors.text,
              padding: 16,
              fontSize: 15,
              fontFamily: 'ui-monospace, monospace',
              resize: 'vertical',
              width: '100%',
              minHeight: 160,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="Paste your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>Output</label>
          <textarea
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              color: colors.text,
              padding: 16,
              fontSize: 15,
              fontFamily: 'ui-monospace, monospace',
              resize: 'vertical',
              width: '100%',
              minHeight: 160,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            value={output}
            readOnly
            placeholder="Result will appear here..."
            spellCheck={false}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              style={{
                backgroundColor: 'transparent',
                color: copied ? '#22C55E' : colors.textSecondary,
                border: `1px solid ${copied ? '#22C55E' : colors.border}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: output ? 1 : 0.4,
              }}
              onClick={handleCopy}
              disabled={!output}
            >
              <Copy size={14} />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: output ? 1 : 0.4,
              }}
              onClick={handleSave}
              disabled={!output}
            >
              <Download size={14} />
              Save to file
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 15, color: colors.textSecondary }}>
          <div
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              backgroundColor: caseSensitive ? colors.accent : colors.border,
              position: 'relative',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => setCaseSensitive(!caseSensitive)}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: colors.text,
                position: 'absolute',
                top: 3,
                left: caseSensitive ? 21 : 3,
                transition: 'left 0.2s',
              }}
            />
          </div>
          Case sensitive
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 15, color: colors.textSecondary }}>
          <div
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              backgroundColor: removeEmpty ? colors.accent : colors.border,
              position: 'relative',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => setRemoveEmpty(!removeEmpty)}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: colors.text,
                position: 'absolute',
                top: 3,
                left: removeEmpty ? 21 : 3,
                transition: 'left 0.2s',
              }}
            />
          </div>
          Remove empty lines
        </label>
        <button
          style={{
            backgroundColor: colors.accent,
            color: colors.text,
            border: 'none',
            borderRadius: 10,
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginLeft: 'auto',
          }}
          onClick={handleRemove}
          disabled={!input.trim()}
        >
          <Zap size={16} />
          Remove Duplicates
        </button>
      </div>

      {stats && (
        <div>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Results</label>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 12,
              padding: 16,
              backgroundColor: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{stats.original}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Original</div>
            </div>
            <div style={{ color: colors.border, alignSelf: 'center', fontSize: 20 }}>|</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.accent }}>{stats.unique}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Unique</div>
            </div>
            <div style={{ color: colors.border, alignSelf: 'center', fontSize: 20 }}>|</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#EF4444' }}>{stats.removed}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Removed</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: colors.textSecondary }}>
            <span>{stats.original.toLocaleString()} lines processed</span>
            <span>|</span>
            <span>{((stats.removed / stats.original) * 100).toFixed(1)}% duplicates removed</span>
          </div>
        </div>
      )}
    </div>
  );
}
