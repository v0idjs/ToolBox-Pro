import { useState } from 'react';
import { Copy, Check, FileText, Minimize2 } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function YAMLFormatter() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const colors = useThemeColors();

  const validateYAML = (yaml: string): { valid: boolean; message: string } => {
    if (!yaml.trim()) return { valid: false, message: 'Input is empty' };

    if (yaml.includes('\t')) {
      const lines = yaml.split('\n');
      const tabLines = lines
        .map((line, i) => (line.includes('\t') ? i + 1 : -1))
        .filter((i) => i !== -1);
      return {
        valid: false,
        message: `Tab characters are not allowed in YAML (found on line${tabLines.length > 1 ? 's' : ''}: ${tabLines.join(', ')})`,
      };
    }

    const lines = yaml.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const indent = line.length - line.trimStart().length;
      if (indent % 2 !== 0) {
        return {
          valid: false,
          message: `Inconsistent indentation on line ${i + 1} (expected multiple of 2 spaces, found ${indent})`,
        };
      }

      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('-')) {
        if (trimmed === '-') {
          const nextLine = lines.slice(i + 1).find((l) => l.trim());
          if (nextLine && (nextLine.trim().startsWith('- ') || nextLine.trim() === '-')) {
            continue;
          }
        }
      }

      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const beforeColon = trimmed.substring(0, colonIndex).trim();
        if (beforeColon.includes(':') || beforeColon.includes('{') || beforeColon.includes('}')) {
          return {
            valid: false,
            message: `Invalid key on line ${i + 1}: "${beforeColon}"`,
          };
        }
      }

      const bracketCount = (line.match(/[{}]/g) || []).length;
      const bracketOpen = (line.match(/\{/g) || []).length;
      const bracketClose = (line.match(/\}/g) || []).length;
      if (bracketOpen !== bracketClose) {
        return {
          valid: false,
          message: `Unbalanced brackets on line ${i + 1}`,
        };
      }
    }

    const openBrackets = (yaml.match(/\{/g) || []).length;
    const closeBrackets = (yaml.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      return { valid: false, message: 'Unbalanced curly braces in document' };
    }

    const openBracketsSquare = (yaml.match(/\[/g) || []).length;
    const closeBracketsSquare = (yaml.match(/\]/g) || []).length;
    if (openBracketsSquare !== closeBracketsSquare) {
      return { valid: false, message: 'Unbalanced square brackets in document' };
    }

    return { valid: true, message: 'YAML syntax looks valid' };
  };

  const beautify = () => {
    const lines = input.split('\n');
    const result: string[] = [];
    let indent = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        result.push('');
        continue;
      }

      const isListItem = trimmed.startsWith('- ');
      const isKeyValue = trimmed.includes(':') && !trimmed.startsWith('-');

      if (isListItem) {
        result.push('  '.repeat(indent) + trimmed);
      } else if (trimmed.endsWith(':')) {
        result.push('  '.repeat(indent) + trimmed);
        indent++;
      } else if (isKeyValue) {
        result.push('  '.repeat(indent) + trimmed);
      } else {
        result.push('  '.repeat(indent) + trimmed);
        if (indent > 0 && !trimmed.startsWith('-')) {
          indent = Math.max(0, indent - 1);
        }
      }
    }

    setInput(result.join('\n'));
    setValidation(null);
  };

  const minify = () => {
    const result = input
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.trim())
      .join('\n');

    setInput(result);
    setValidation(null);
  };

  const handleValidate = () => {
    const result = validateYAML(input);
    setValidation(result);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: colors.text,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileText size={28} color={colors.accent} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>YAML Formatter</h1>
        </div>

        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          <label style={{ display: 'block', fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>
            Raw YAML Input
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setValidation(null);
            }}
            placeholder="Paste your YAML here..."
            style={{
              width: '100%',
              minHeight: '300px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '16px',
              color: colors.text,
              fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={beautify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: colors.accent,
              color: colors.text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <FileText size={16} />
            Beautify
          </button>

          <button
            onClick={minify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: colors.border,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Minimize2 size={16} />
            Minify
          </button>

          <button
            onClick={handleValidate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: validation?.valid ? '#16A34A' : colors.border,
              color: colors.text,
              border: `1px solid ${validation?.valid ? '#22C55E' : colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Validate
          </button>

          <button
            onClick={handleCopy}
            disabled={!input}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: copied ? '#16A34A' : colors.border,
              color: colors.text,
              border: `1px solid ${copied ? '#22C55E' : colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: input ? 'pointer' : 'not-allowed',
              opacity: input ? 1 : 0.5,
              transition: 'opacity 0.2s',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {validation && (
          <div
            style={{
              background: colors.card,
              border: `1px solid ${validation.valid ? '#22C55E' : '#EF4444'}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: validation.valid ? '#22C55E' : '#EF4444',
                flexShrink: 0,
              }}
            />
            <span style={{ color: validation.valid ? '#22C55E' : '#EF4444', fontSize: '14px', fontWeight: 500 }}>
              {validation.message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
