import { useState } from 'react';
import { Copy, Check, FileText, Minimize2, Zap } from 'lucide-react';
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
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <FileText size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>YAML Formatter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Beautify, minify, and validate YAML documents with syntax checking
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10, color: colors.text }}>
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
            minHeight: 300,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            color: colors.text,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            fontSize: 15,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: 12, margin: '20px 0', flexWrap: 'wrap' }}>
          <button
            onClick={beautify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: colors.accent,
              color: colors.text,
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Zap size={16} />
            Beautify
          </button>

          <button
            onClick={minify}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: colors.border,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
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
              gap: 8,
              padding: '10px 20px',
              background: validation?.valid ? '#16A34A' : colors.border,
              color: colors.text,
              border: `1px solid ${validation?.valid ? '#22C55E' : colors.border}`,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
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
              gap: 8,
              padding: '10px 20px',
              background: copied ? '#16A34A' : colors.border,
              color: colors.text,
              border: `1px solid ${copied ? '#22C55E' : colors.border}`,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
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
              border: `1px solid ${validation.valid ? '#22C55E' : '#EF4444'}`,
              borderRadius: 10,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: validation.valid ? '#22C55E' : '#EF4444',
                flexShrink: 0,
              }}
            />
            <span style={{ color: validation.valid ? '#22C55E' : '#EF4444', fontSize: 15, fontWeight: 500 }}>
              {validation.message}
            </span>
          </div>
        )}

        {input && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 20,
            padding: '10px 0',
            borderTop: `1px solid ${colors.border}`,
            fontSize: 13,
            color: colors.textSecondary,
          }}>
            <span>{validation?.valid ? 'Valid YAML' : validation?.message || 'Not validated'}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>{input.split('\n').length} lines</span>
            <span style={{ color: colors.border }}>|</span>
            <span>{input.length} chars</span>
          </div>
        )}
      </div>
    </div>
  );
}
