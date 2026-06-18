import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface AnalysisResult {
  score: number;
  label: string;
  color: string;
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
  const colors = ['#EF4444', '#EF4444', '#F59E0B', '#22C55E', '#22C55E', '#22C55E'];

  const suggestions = generateSuggestions(password, charsetSize, patterns);

  return {
    score,
    label: labels[score],
    color: colors[score],
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

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Shield size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Password Strength Analyzer</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Analyze password entropy, detect patterns, estimate crack time, and get improvement suggestions.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>Password</label>
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password to analyze..."
          autoFocus
          style={{
            width: '100%',
            padding: 14,
            backgroundColor: colors.input,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: 'ui-monospace, monospace',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {result && (
        <>
          <div
            style={{
              background: `${result.color}15`,
              border: `1px solid ${result.color}40`,
              borderRadius: 10,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {result.score >= 3 ? (
                <Check size={20} color={result.color} />
              ) : (
                <AlertTriangle size={20} color={result.color} />
              )}
              <span style={{ fontWeight: 600, fontSize: 18, color: result.color }}>{result.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14, color: colors.textSecondary }}>
              <span>Entropy: {result.entropy.toFixed(1)} bits</span>
              <span>|</span>
              <span>Charset: {result.charsetSize} characters</span>
              <span>|</span>
              <span>Length: {password.length}</span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Crack Time Estimates</label>
            <div
              style={{
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', fontWeight: 500 }}>Attack Scenario</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', fontWeight: 500 }}>Estimated Time</th>
                  </tr>
                </thead>
                <tbody>
                  {result.crackTimes.map((ct, i) => (
                    <tr key={ct.scenario} style={{ borderBottom: i < result.crackTimes.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                      <td style={{ padding: '12px 16px', fontSize: 15 }}>{ct.scenario}</td>
                      <td style={{ padding: '12px 16px', fontSize: 15, textAlign: 'right', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{ct.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.patterns.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Detected Patterns</label>
              <div
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: `1px solid rgba(239,68,68,0.3)`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                {result.patterns.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, color: colors.text }}>
                    <AlertTriangle size={14} color="#EF4444" />
                    <span>{p.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Improvement Suggestions</label>
              <div
                style={{
                  backgroundColor: 'rgba(34,197,94,0.08)',
                  border: `1px solid rgba(34,197,94,0.3)`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, color: colors.text }}>
                    <Check size={14} color="#22C55E" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
