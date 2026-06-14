import { useState, useMemo } from 'react';
import { Search, AlertCircle, Check, Copy, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [copied, setCopied] = useState(false);
  const colors = useThemeColors();

  const result = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, highlighted: testString };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: Array<{ index: number; text: string; groups: string[] }> = [];
      let match: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          });
        }
      }

      const highlighted = highlightMatches(testString, matches);
      return { matches, error: null, highlighted };
    } catch (e) {
      return { matches: [], error: (e as Error).message, highlighted: testString };
    }
  }, [pattern, flags, testString]);

  const copyToClipboard = async () => {
    if (!result.highlighted) return;
    await navigator.clipboard.writeText(testString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Search size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Regex Tester</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Test regular expressions with real-time matching and highlighting
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>
            Pattern
          </label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            style={{
              width: '100%',
              padding: 14,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              color: colors.text,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>
            Flags
          </label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m, s..."
            style={{
              width: '100%',
              padding: 14,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              color: colors.text,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>
            Test String
          </label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            rows={6}
            style={{
              width: '100%',
              padding: 16,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              color: colors.text,
              fontSize: 15,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace',
              minHeight: 160,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {result.error && (
          <div style={{ border: '1px solid #DC2626', borderRadius: 10, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(220, 38, 38, 0.1)' }}>
            <AlertCircle size={20} color="#DC2626" />
            <span style={{ color: '#FCA5A5', fontSize: 15 }}>{result.error}</span>
          </div>
        )}

        {!result.error && pattern && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
                Result
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
                  backgroundColor: colors.border,
                  color: copied ? '#10B981' : colors.textSecondary,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}>
              {result.matches.length > 0 ? (
                <Check size={18} color="#22C55E" />
              ) : (
                <AlertCircle size={18} color={colors.textSecondary} />
              )}
              <span style={{ fontSize: 15, color: colors.textSecondary }}>
                {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'} found
              </span>
            </div>

            <div style={{
              padding: 16,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              fontFamily: 'monospace',
              fontSize: 15,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
            dangerouslySetInnerHTML={{ __html: result.highlighted }}
            role="region"
            aria-label="Highlighted regex matches"
            />

            {result.matches.length > 0 && (
              <div>
                <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, display: 'block', color: colors.text }}>
                  Matches
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.matches.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 16,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: colors.accent }}>Match {i + 1}</span>
                        <span style={{ fontSize: 13, color: colors.textSecondary }}>Index: {m.index}</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 15, color: colors.text, marginBottom: m.groups.length > 0 ? 8 : 0 }}>
                        "{m.text}"
                      </div>
                      {m.groups.length > 0 && (
                        <div style={{ fontSize: 13, color: colors.textSecondary }}>
                          Groups: {m.groups.map((g, gi) => (
                            <span key={gi} style={{ color: '#F59E0B', marginLeft: 4 }}>
                              ${gi + 1}: {g ?? 'undefined'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <span>Pattern: {pattern}</span>
              <span style={{ color: colors.border }}>|</span>
              <span>Flags: {flags || 'none'}</span>
              <span style={{ color: colors.border }}>|</span>
              <span>{result.matches.length} matches</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function highlightMatches(text: string, matches: Array<{ index: number; text: string }>): string {
  if (matches.length === 0) return escapeHtml(text);

  const parts: string[] = [];
  let lastIndex = 0;

  const sorted = [...matches].sort((a, b) => a.index - b.index);

  for (const match of sorted) {
    if (match.index < lastIndex) continue;
    parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    parts.push(`<span style="background: #2563EB33; border-radius: 2px;">${escapeHtml(match.text)}</span>`);
    lastIndex = match.index + match.text.length;
  }

  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
