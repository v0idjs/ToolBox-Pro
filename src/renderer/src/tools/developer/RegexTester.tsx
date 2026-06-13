import { useState, useMemo } from 'react';
import { Search, AlertCircle, Check } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
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

  return (
    <div style={{ color: colors.text }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Search size={24} color={colors.accent} />
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Regex Tester</h1>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            style={{
              width: '100%',
              padding: '12px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>Flags</label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m, s..."
            style={{
              width: '100%',
              padding: '12px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {result.error && (
          <div style={{ background: colors.card, border: '1px solid #DC2626', borderRadius: '8px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="#DC2626" />
            <span style={{ color: '#FCA5A5', fontSize: '14px' }}>{result.error}</span>
          </div>
        )}

        {!result.error && pattern && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              {result.matches.length > 0 ? (
                <Check size={18} color="#22C55E" />
              ) : (
                <AlertCircle size={18} color={colors.textSecondary} />
              )}
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'} found
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highlighted</div>
              <div
                style={{
                  padding: '12px',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                }}
              dangerouslySetInnerHTML={{ __html: result.highlighted }}
              role="region"
              aria-label="Highlighted regex matches"
            />
            </div>

            {result.matches.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matches</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.matches.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: colors.accent }}>Match {i + 1}</span>
                        <span style={{ fontSize: '12px', color: colors.textSecondary }}>Index: {m.index}</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '14px', color: colors.text, marginBottom: m.groups.length > 0 ? '8px' : 0 }}>
                        "{m.text}"
                      </div>
                      {m.groups.length > 0 && (
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                          Groups: {m.groups.map((g, gi) => (
                            <span key={gi} style={{ color: '#F59E0B', marginLeft: '4px' }}>
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
