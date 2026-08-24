import { useState, useMemo } from 'react'
import { Shield, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

interface AnalysisResult {
  score: number;
  label: string;
  entropy: number;
  charsetSize: number;
  crackTimes: { scenario: string; time: string }[];
  patterns: { type: string; message: string }[];
  suggestions: string[];
}

const COMMON_WORDS = [
  'password', 'letmein', 'welcome', 'admin', 'login', 'master', 'dragon',
  'qwerty', 'abc123', 'monkey', '123456', 'shadow', 'sunshine', 'princess',
  'football', 'charlie', 'hello', 'freedom', 'whatever', 'trustno1',
  'iloveyou', 'batman', 'access', 'superman', 'michael', 'ashley',
  'passw0rd', 'passwd', 'test', 'guest', 'root', 'toor', 'pass',
  'changer', 'internet', 'harley', 'ranger', 'buster', 'thomas',
  'hockey', 'killer', 'george', 'sexy', 'andrew', 'joshua', 'matthew',
  'daniel', 'robert', 'jordan', 'hunter', 'buster', 'thomas', 'summer',
];

const KEYBOARD_ROWS = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '1234567890',
];

const SEQUENTIAL = 'abcdefghijklmnopqrstuvwxyz0123456789';

function getCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 33;
  return size;
}

function calculateEntropy(password: string, charsetSize: number): number {
  if (password.length === 0) return 0;
  return password.length * Math.log2(charsetSize || 1);
}

function estimateCrackTime(entropy: number): { scenario: string; time: string }[] {
  const guessesPerSec = [
    { scenario: 'Offline (10B/s)', rate: 1e10 },
    { scenario: 'Offline (1T/s)', rate: 1e12 },
    { scenario: 'Online (100/s)', rate: 100 },
    { scenario: 'Throttled (10/hr)', rate: 10 / 3600 },
  ];

  return guessesPerSec.map(({ scenario, rate }) => {
    const guesses = Math.pow(2, entropy);
    const seconds = guesses / rate / 2;
    return { scenario, time: formatTime(seconds) };
  });
}

function formatTime(seconds: number): string {
  if (seconds < 0.001) return 'Instant';
  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
  if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1000)).toFixed(1)}K years`;
  if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toFixed(1)}M years`;
  return `${(seconds / (86400 * 365 * 1e9)).toExponential(1)} years`;
}

function detectPatterns(password: string): { type: string; message: string }[] {
  const patterns: { type: string; message: string }[] = [];
  const lower = password.toLowerCase();

  for (const word of COMMON_WORDS) {
    if (lower.includes(word)) {
      patterns.push({ type: 'common', message: `Contains common word "${word}"` });
    }
  }

  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - 3; i++) {
      const seq = row.substring(i, i + 3);
      if (lower.includes(seq)) {
        patterns.push({ type: 'keyboard', message: `Contains keyboard sequence "${seq}"` });
      }
      const rev = seq.split('').reverse().join('');
      if (lower.includes(rev)) {
        patterns.push({ type: 'keyboard', message: `Contains reversed keyboard sequence "${rev}"` });
      }
    }
  }

  for (let i = 0; i <= SEQUENTIAL.length - 3; i++) {
    const seq = SEQUENTIAL.substring(i, i + 3);
    if (lower.includes(seq)) {
      patterns.push({ type: 'sequential', message: `Contains sequential characters "${seq}"` });
    }
    const rev = seq.split('').reverse().join('');
    if (lower.includes(rev)) {
      patterns.push({ type: 'sequential', message: `Contains reversed sequence "${rev}"` });
    }
  }

  const repeats = password.match(/(.)\1{2,}/g);
  if (repeats) {
    for (const r of repeats) {
      patterns.push({ type: 'repetition', message: `Contains repeated character "${r[0]}" (${r.length}x)` });
    }
  }

  if (/^\d+$/.test(password)) {
    patterns.push({ type: 'numeric', message: 'Password is entirely numeric' });
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    patterns.push({ type: 'alpha', message: 'Password contains only letters' });
  }

  const years = password.match(/\b(19|20)\d{2}\b/g);
  if (years) {
    patterns.push({ type: 'year', message: `Contains year ${years[0]}` });
  }

  return patterns;
}

function generateSuggestions(password: string, charsetSize: number, patterns: { type: string; message: string }[]): string[] {
  const suggestions: string[] = [];

  if (password.length < 12) {
    suggestions.push('Use at least 12 characters');
  }
  if (password.length < 16) {
    suggestions.push('Consider using 16+ characters for strong security');
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters');
  }
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters');
  }
  if (!/[0-9]/.test(password)) {
    suggestions.push('Add numbers');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }
  if (charsetSize < 40) {
    suggestions.push('Increase character variety');
  }
  if (patterns.some((p) => p.type === 'common')) {
    suggestions.push('Avoid common words and dictionary terms');
  }
  if (patterns.some((p) => p.type === 'keyboard')) {
    suggestions.push('Avoid keyboard patterns like "qwerty"');
  }
  if (patterns.some((p) => p.type === 'sequential')) {
    suggestions.push('Avoid sequential characters like "abc" or "123"');
  }
  if (patterns.some((p) => p.type === 'repetition')) {
    suggestions.push('Avoid repeating the same character multiple times');
  }
  if (patterns.some((p) => p.type === 'numeric')) {
    suggestions.push('Mix letters and numbers');
  }
  if (password.length > 0 && patterns.length === 0 && password.length >= 16) {
    suggestions.push('Great password! Consider using a password manager');
  }

  return suggestions;
}

function analyzePassword(password: string): AnalysisResult | null {
  if (!password) return null;

  const charsetSize = getCharsetSize(password);
  const entropy = calculateEntropy(password, charsetSize);
  const patterns = detectPatterns(password);
  const crackTimes = estimateCrackTime(entropy);

  let score = 0;
  if (entropy >= 60) score += 3;
  else if (entropy >= 40) score += 2;
  else if (entropy >= 25) score += 1;

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (patterns.length === 0) score += 1;
  if (patterns.some((p) => p.type === 'common')) score -= 2;
  if (patterns.some((p) => p.type === 'keyboard')) score -= 1;

  score = Math.max(0, Math.min(5, score));

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  const suggestions = generateSuggestions(password, charsetSize, patterns);

  return {
    score,
    label: labels[score],
    entropy,
    charsetSize,
    crackTimes,
    patterns,
    suggestions,
  };
}

export function PasswordStrengthAnalyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const colors = useThemeColors();

  const result = useMemo(() => analyzePassword(password), [password]);

  const verdictColor =
    result && result.score <= 1
      ? colors.error
      : result && result.score === 2
        ? colors.warning
        : colors.success;

  return (
    <div>
      <ToolHeader
        name="Password Strength Analyzer"
        description="Analyze password entropy, detect patterns, estimate crack time, and get improvement suggestions."
        category="security"
        icon={Shield}
        serial="password-strength"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="tb-panel" style={{ padding: 20 }}>
          <SectionLabel
            hint={
              <Button
                variant="ghost"
                size="sm"
                icon={showPassword ? EyeOff : Eye}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            }
          >
            Password
          </SectionLabel>
          <input
            type={showPassword ? 'text' : 'password'}
            className="tb-field tb-mono"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to analyze..."
            autoFocus
            spellCheck={false}
            style={{ width: '100%', fontSize: 15 }}
          />
        </div>

        {result && (
          <>
            <div
              style={{
                background: `${verdictColor}15`,
                border: `1px solid ${verdictColor}40`,
                borderRadius: 'var(--tb-radius-panel)',
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {result.score >= 3 ? (
                    <Check size={20} color={verdictColor} />
                  ) : (
                    <AlertTriangle size={20} color={verdictColor} />
                  )}
                  <span style={{ fontWeight: 600, fontSize: 18, color: verdictColor }}>{result.label}</span>
                </div>
                <span
                  className="tb-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '2px 7px',
                    borderRadius: 3,
                    border: `1px solid ${verdictColor}`,
                    color: verdictColor,
                  }}
                >
                  {result.score} / 5
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(result.score / 5) * 100}%`,
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: verdictColor,
                    transition: 'width var(--tb-speed) ease, background-color var(--tb-speed-fast) ease',
                  }}
                />
              </div>
              <div className="tb-mono" style={{ display: 'flex', flexWrap: 'wrap', columnGap: 20, rowGap: 6, marginTop: 14, fontSize: 11.5, letterSpacing: '0.03em', color: colors.textSecondary }}>
                <span>Entropy: {result.entropy.toFixed(1)} bits</span>
                <span>Charset: {result.charsetSize} characters</span>
                <span>Length: {password.length}</span>
              </div>
            </div>

            <div className="tb-panel" style={{ padding: 20 }}>
              <SectionLabel>Crack Time Estimates</SectionLabel>
              <div
                style={{
                  backgroundColor: colors.bgDeep,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'var(--tb-radius-ctl)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th
                        className="tb-mono"
                        style={{
                          textAlign: 'left',
                          padding: '10px 16px',
                          color: colors.textFaint,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontWeight: 600,
                        }}
                      >
                        Attack Scenario
                      </th>
                      <th
                        className="tb-mono"
                        style={{
                          textAlign: 'right',
                          padding: '10px 16px',
                          color: colors.textFaint,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontWeight: 600,
                        }}
                      >
                        Estimated Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.crackTimes.map((ct, i) => (
                      <tr key={ct.scenario} style={{ borderBottom: i < result.crackTimes.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                        <td style={{ padding: '11px 16px', fontSize: 13.5, color: colors.text }}>{ct.scenario}</td>
                        <td
                          className="tb-mono"
                          style={{
                            padding: '11px 16px',
                            fontSize: 13,
                            textAlign: 'right',
                            fontWeight: 600,
                            color: colors.text,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {ct.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {result.patterns.length > 0 && (
              <div className="tb-panel" style={{ padding: 20 }}>
                <SectionLabel hint={`${result.patterns.length} detected`}>Detected Patterns</SectionLabel>
                <div
                  style={{
                    backgroundColor: `${colors.error}15`,
                    border: `1px solid ${colors.error}40`,
                    borderRadius: 'var(--tb-radius-ctl)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {result.patterns.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: colors.text }}>
                      <AlertTriangle size={14} color={colors.error} style={{ flexShrink: 0 }} />
                      <span>{p.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div className="tb-panel" style={{ padding: 20 }}>
                <SectionLabel hint={`${result.suggestions.length} tips`}>Improvement Suggestions</SectionLabel>
                <div
                  style={{
                    backgroundColor: `${colors.success}15`,
                    border: `1px solid ${colors.success}40`,
                    borderRadius: 'var(--tb-radius-ctl)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: colors.text }}>
                      <Check size={14} color={colors.success} style={{ flexShrink: 0 }} />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
