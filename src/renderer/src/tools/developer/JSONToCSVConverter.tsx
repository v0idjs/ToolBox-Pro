import React, { useState, useCallback } from 'react';
import { ArrowLeftRight, Copy, Check, ArrowDownUp, Upload } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val as Record<string, unknown>, fullKey));
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val);
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

function jsonToCsv(data: unknown): string {
  let rows: Record<string, unknown>[];
  if (Array.isArray(data)) {
    rows = data.map((item) =>
      typeof item === 'object' && item !== null ? flattenObject(item as Record<string, unknown>) : { value: item }
    );
  } else if (typeof data === 'object' && data !== null) {
    rows = [flattenObject(data as Record<string, unknown>)];
  } else {
    return String(data);
  }

  if (rows.length === 0) return '';

  const allKeys = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)));
  const headers = Array.from(allKeys);

  const csvEscape = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

function csvToJson(csv: string): unknown[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    if (lines.length === 1) {
      const headers = parseCsvLine(lines[0]);
      return headers.map(() => {
        const obj: Record<string, string> = {};
        headers.forEach((h) => (obj[h] = ''));
        return obj;
      });
    }
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ''));
    return obj;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export function JSONToCSVConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const colors = useThemeColors();

  const handleConvert = useCallback(() => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      if (direction === 'json-to-csv') {
        const parsed = JSON.parse(input);
        const csv = jsonToCsv(parsed);
        setOutput(csv);
      } else {
        const parsed = csvToJson(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError(direction === 'json-to-csv' ? 'Invalid JSON input' : 'Invalid CSV input');
    }
  }, [input, direction]);

  const handleSwap = useCallback(() => {
    setDirection((d) => (d === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv'));
    setInput(output);
    setOutput('');
    setError('');
  }, [output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [output]);

  const handleFileUpload = useCallback(async () => {
    try {
      const result = await window.api.openFile();
      if (result) {
        setInput(result.content);
        setOutput('');
        setError('');
      }
    } catch {}
  }, []);

  const handleSave = useCallback(async () => {
    if (!output) return;
    try {
      const ext = direction === 'json-to-csv' ? '.csv' : '.json';
      await window.api.saveFile(output, ext);
    } catch {}
  }, [output, direction]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setOutput('');
      setError('');
    } catch {}
  }, []);

  const inputLabel = direction === 'json-to-csv' ? 'JSON Input' : 'CSV Input';
  const outputLabel = direction === 'json-to-csv' ? 'CSV Output' : 'JSON Output';

  const inputRows = input.split('\n').length;
  const outputRows = output.split('\n').length;

  const textareaStyle: React.CSSProperties = {
    background: colors.input,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    fontSize: 14,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    outline: 'none',
    width: '100%',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <ArrowLeftRight size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>JSON ↔ CSV Converter</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Flatten nested JSON to CSV with dot-notation keys, or parse CSV back to JSON
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={handleSwap}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: colors.accent, color: '#fff', fontSize: 14, fontWeight: 600,
          }}
        >
          <ArrowDownUp size={16} />
          {direction === 'json-to-csv' ? 'JSON → CSV' : 'CSV → JSON'}
        </button>
        <button
          onClick={handleConvert}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: colors.accent, color: '#fff', fontSize: 14, fontWeight: 600,
          }}
        >
          <ArrowLeftRight size={16} /> Convert
        </button>
        <button
          onClick={handleFileUpload}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: colors.accent, color: '#fff', fontSize: 14, fontWeight: 600,
          }}
        >
          <Upload size={16} /> Open File
        </button>
      </div>

      {error && (
        <div style={{
          background: '#DC262615', border: '1px solid #DC262640',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          color: '#EF4444', fontSize: 14, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {inputLabel}
            </span>
            <button
              onClick={handlePaste}
              style={{
                background: colors.input, border: `1px solid ${colors.border}`,
                borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                color: colors.textSecondary, fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Paste
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); setError(''); }}
            placeholder={direction === 'json-to-csv' ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]' : 'name,age\nAlice,30\nBob,25'}
            style={{ ...textareaStyle, minHeight: 300 }}
            spellCheck={false}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
            {inputRows} rows
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {outputLabel}
            </span>
            {output && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    background: colors.input, border: `1px solid ${colors.border}`,
                    borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                    color: copied ? '#22C55E' : colors.textSecondary, fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} Copy
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: colors.input, border: `1px solid ${colors.border}`,
                    borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                    color: colors.textSecondary, fontSize: 12, fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={direction === 'json-to-csv' ? 'Converted CSV will appear here...' : 'Converted JSON will appear here...'}
            style={{ ...textareaStyle, minHeight: 300, opacity: output ? 1 : 0.6 }}
            spellCheck={false}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
            {outputRows} rows
          </div>
        </div>
      </div>
    </div>
  );
}
