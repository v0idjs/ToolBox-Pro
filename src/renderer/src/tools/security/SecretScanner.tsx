import { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Check, Copy } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface SecretPattern {
  id: string;
  name: string;
  severity: 'high' | 'medium' | 'low';
  regex: string;
  flags: string;
  description: string;
}

interface Finding {
  line: number;
  column: number;
  match: string;
  context: string;
  pattern: SecretPattern;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    id: 'aws-access-key',
    name: 'AWS Access Key',
    severity: 'high',
    regex: '\\b(AKIA[0-9A-Z]{16})\\b',
    flags: 'g',
    description: 'AWS IAM access key ID',
  },
  {
    id: 'aws-secret-key',
    name: 'AWS Secret Key',
    severity: 'high',
    regex: '\\b(?:aws_secret_access_key|aws_secret_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9/+=]{40})[\'"]?',
    flags: 'gi',
    description: 'AWS secret access key',
  },
  {
    id: 'github-token',
    name: 'GitHub Token',
    severity: 'high',
    regex: '\\b(ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|ghr_[A-Za-z0-9]{36})\\b',
    flags: 'g',
    description: 'GitHub personal access token or OAuth token',
  },
  {
    id: 'github-fine-grained',
    name: 'GitHub Fine-Grained Token',
    severity: 'high',
    regex: '\\b(github_pat_[A-Za-z0-9_]{82})\\b',
    flags: 'g',
    description: 'GitHub fine-grained personal access token',
  },
  {
    id: 'gitlab-token',
    name: 'GitLab Token',
    severity: 'high',
    regex: '\\b(glpat-[A-Za-z0-9\\-_]{20,})\\b',
    flags: 'g',
    description: 'GitLab personal access token',
  },
  {
    id: 'slack-token',
    name: 'Slack Token',
    severity: 'high',
    regex: '\\b(xox[bpoas]-[A-Za-z0-9\\-]{10,})\\b',
    flags: 'g',
    description: 'Slack bot or user token',
  },
  {
    id: 'slack-webhook',
    name: 'Slack Webhook',
    severity: 'medium',
    regex: '\\b(https:\\/\\/hooks\\.slack\\.com\\/services\\/T[A-Z0-9]+\\/B[A-Z0-9]+\\/[A-Za-z0-9]+)\\b',
    flags: 'g',
    description: 'Slack incoming webhook URL',
  },
  {
    id: 'stripe-key',
    name: 'Stripe API Key',
    severity: 'high',
    regex: '\\b([rsk]live_[A-Za-z0-9]{24,}|[rsk]test_[A-Za-z0-9]{24,})\\b',
    flags: 'g',
    description: 'Stripe API secret or restricted key',
  },
  {
    id: 'google-api-key',
    name: 'Google API Key',
    severity: 'high',
    regex: '\\b(AIza[0-9A-Za-z\\-_]{35})\\b',
    flags: 'g',
    description: 'Google API key',
  },
  {
    id: 'google-oauth',
    name: 'Google OAuth Secret',
    severity: 'high',
    regex: '\\b(?:client_secret|oauth_secret)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{24,})[\'"]?',
    flags: 'gi',
    description: 'Google OAuth client secret',
  },
  {
    id: 'gcp-service-account',
    name: 'GCP Service Account Key',
    severity: 'high',
    regex: '"private_key"\\s*:\\s*"-----BEGIN (?:RSA )?PRIVATE KEY-----\\\\n[A-Za-z0-9/+=\\\\n]+-----END (?:RSA )?PRIVATE KEY-----\\\\n"',
    flags: 'g',
    description: 'GCP service account private key',
  },
  {
    id: 'azure-connection',
    name: 'Azure Connection String',
    severity: 'high',
    regex: '\\b(AccountKey|SharedAccessKey|DefaultEndpointsProtocol)\\s*=\\s*[A-Za-z0-9/+=]{40,}',
    flags: 'gi',
    description: 'Azure storage or service connection string',
  },
  {
    id: 'heroku-api-key',
    name: 'Heroku API Key',
    severity: 'high',
    regex: '\\b(?:heroku[_-]?api[_-]?key)\\s*[:=]\\s*[\'"]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[\'"]?',
    flags: 'gi',
    description: 'Heroku API key',
  },
  {
    id: 'npm-token',
    name: 'NPM Token',
    severity: 'high',
    regex: '\\b(npm_[A-Za-z0-9]{36})\\b',
    flags: 'g',
    description: 'NPM access token',
  },
  {
    id: 'pypi-token',
    name: 'PyPI Token',
    severity: 'high',
    regex: '\\b(pypi-[A-Za-z0-9\\-_]{50,})\\b',
    flags: 'g',
    description: 'PyPI API token',
  },
  {
    id: 'sendgrid-key',
    name: 'SendGrid API Key',
    severity: 'high',
    regex: '\\b(SG\\.[A-Za-z0-9\\-_]{22}\\.[A-Za-z0-9\\-_]{43})\\b',
    flags: 'g',
    description: 'SendGrid API key',
  },
  {
    id: 'twilio-api-key',
    name: 'Twilio API Key',
    severity: 'high',
    regex: '\\b(SK[0-9a-fA-F]{32})\\b',
    flags: 'g',
    description: 'Twilio API key',
  },
  {
    id: 'private-key-pem',
    name: 'Private Key (PEM)',
    severity: 'high',
    regex: '-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----',
    flags: 'g',
    description: 'Cryptographic private key in PEM format',
  },
  {
    id: 'generic-api-key',
    name: 'Generic API Key',
    severity: 'medium',
    regex: '\\b(?:api[_-]?key|apikey|api[_-]?secret|access[_-]?key|auth[_-]?token|secret[_-]?key|client[_-]?secret)\\s*[:=]\\s*[\'"]([A-Za-z0-9\\-_]{20,})[\'"]',
    flags: 'gi',
    description: 'Generic API key or secret token',
  },
  {
    id: 'generic-password',
    name: 'Hardcoded Password',
    severity: 'medium',
    regex: '\\b(?:password|passwd|pwd)\\s*[:=]\\s*[\'"]([^\'"]{8,})[\'"]',
    flags: 'gi',
    description: 'Hardcoded password in source code',
  },
  {
    id: 'connection-string',
    name: 'Database Connection String',
    severity: 'high',
    regex: '\\b(?:mysql|postgres|postgresql|mongodb|redis|mssql):\\/\\/[^\\s\'"]+',
    flags: 'gi',
    description: 'Database connection string with credentials',
  },
  {
    id: 'jwt-token',
    name: 'JWT Token',
    severity: 'medium',
    regex: '\\beyJ[A-Za-z0-9\\-_]+\\.eyJ[A-Za-z0-9\\-_]+\\.[A-Za-z0-9\\-_]+',
    flags: 'g',
    description: 'JSON Web Token (may contain sensitive data)',
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function SecretScanner() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const colors = useThemeColors();

  const findings = useMemo<Finding[]>(() => {
    if (!input) return [];
    const results: Finding[] = [];
    const lines = input.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of SECRET_PATTERNS) {
        try {
          const regex = new RegExp(pattern.regex, pattern.flags);
          let match;
          while ((match = regex.exec(line)) !== null) {
            const start = Math.max(0, match.index - 20);
            const end = Math.min(line.length, match.index + match[0].length + 20);
            const context = (start > 0 ? '...' : '') + line.substring(start, end) + (end < line.length ? '...' : '');

            results.push({
              line: i + 1,
              column: match.index + 1,
              match: match[0],
              context,
              pattern,
            });
          }
        } catch {
          // skip invalid patterns
        }
      }
    }

    return results;
  }, [input]);

  const stats = useMemo(() => {
    const high = findings.filter((f) => f.pattern.severity === 'high').length;
    const medium = findings.filter((f) => f.pattern.severity === 'medium').length;
    const low = findings.filter((f) => f.pattern.severity === 'low').length;
    return { total: findings.length, high, medium, low };
  }, [findings]);

  const handleCopy = async () => {
    if (findings.length === 0) return;
    const text = findings.map((f) => `Line ${f.line}: [${f.pattern.severity.toUpperCase()}] ${f.pattern.name} - ${f.match}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#3B82F6';
      default: return colors.textSecondary;
    }
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <ShieldAlert size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Secret Scanner</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Detect leaked API keys, tokens, and credentials in code and config files.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>Paste Code or Config</label>
          {input && (
            <span style={{ fontSize: 13, color: colors.textSecondary }}>
              {input.split('\n').length} lines | {formatBytes(new Blob([input]).size)}
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your code, config file, or any text to scan for secrets..."
          style={{
            width: '100%',
            minHeight: 200,
            padding: 16,
            backgroundColor: colors.input,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: 'ui-monospace, monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
          spellCheck={false}
        />
      </div>

      {input && findings.length === 0 && (
        <div
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: `1px solid rgba(34,197,94,0.3)`,
            borderRadius: 10,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={20} color="#22C55E" />
          <span style={{ fontWeight: 500, fontSize: 15 }}>No secrets detected</span>
        </div>
      )}

      {findings.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#EF4444' }}>{stats.high}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>High</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F59E0B' }}>{stats.medium}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Medium</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{stats.total}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Total</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ fontSize: 15, fontWeight: 500 }}>
              Findings ({stats.total} secret{stats.total !== 1 ? 's' : ''} detected)
            </label>
            <button
              onClick={handleCopy}
              style={{
                padding: '8px 16px',
                background: copied ? '#22C55E' : 'transparent',
                color: copied ? '#fff' : colors.textSecondary,
                border: `1px solid ${copied ? '#22C55E' : colors.border}`,
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Report'}
            </button>
          </div>

          <div
            style={{
              backgroundColor: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              maxHeight: 500,
              overflowY: 'auto',
            }}
          >
            {findings.map((f, i) => (
              <div
                key={`${f.line}-${f.column}-${i}`}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < findings.length - 1 ? `1px solid ${colors.border}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: `${severityColor(f.pattern.severity)}20`,
                      color: severityColor(f.pattern.severity),
                    }}
                  >
                    {f.pattern.severity}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>{f.pattern.name}</span>
                  <span style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 'auto' }}>
                    Line {f.line}, Col {f.column}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 13,
                    padding: 10,
                    backgroundColor: colors.bg,
                    borderRadius: 6,
                    wordBreak: 'break-all',
                    color: colors.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {f.context}
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>
                  {f.pattern.description}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
