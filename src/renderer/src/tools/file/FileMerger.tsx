import { useState, useRef } from "react";
import { FolderOpen, Merge, Save, Trash2, ArrowUp, ArrowDown, Zap } from "lucide-react";
import { useThemeColors } from '@/lib/theme';

interface FileEntry {
  id: string;
  name: string;
  size: number;
  content: string;
}

export function FileMerger() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [separator, setSeparator] = useState<"none" | "newline" | "custom">("none");
  const [customSep, setCustomSep] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeColors = useThemeColors();
  const colors = {
    bg: themeColors.bg,
    card: themeColors.card,
    input: themeColors.input,
    border: themeColors.border,
    text: themeColors.text,
    muted: themeColors.textSecondary,
    primary: themeColors.accent,
    danger: "#DC2626",
    hover: themeColors.accentHover,
  };

  const loadFiles = async () => {
    const loaded = await window.api.openFiles();
    if (!loaded) return;
    setFiles((prev) => {
      const newFiles: FileEntry[] = loaded.map((f: { name: string; content: string }) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        size: new Blob([f.content]).size,
        content: f.content,
      }));
      return [...prev, ...newFiles];
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const getSeparator = () => {
    switch (separator) {
      case "newline":
        return "\n";
      case "custom":
        return customSep;
      case "none":
      default:
        return "";
    }
  };

  const mergeFiles = () => {
    const sep = getSeparator();
    const merged = files.map((f) => f.content).join(sep);
    setResult(merged);
  };

  const saveResult = async () => {
    if (!result) return;
    await window.api.saveFile('merged-output.txt', result);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Merge size={28} color={colors.primary} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>File Merger</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.muted, margin: 0, marginBottom: 32 }}>
        Combine multiple text files into one, with configurable separators
      </p>

      <button
        onClick={loadFiles}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 28px",
          background: colors.primary,
          color: colors.text,
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 500,
          marginBottom: 32,
        }}
      >
        <Zap size={16} /> Open Files
      </button>

      {files.length > 0 && (
        <div
          style={{
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 500, fontSize: 15 }}>{files.length} file(s) loaded</span>
            <span style={{ color: colors.muted, fontSize: 13 }}>
              Total: {totalSize.toLocaleString()} bytes
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {files.map((f, i) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: colors.bg,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <button
                  onClick={() => moveFile(i, -1)}
                  disabled={i === 0}
                  style={{ background: "none", border: "none", color: i === 0 ? colors.border : colors.muted, cursor: i === 0 ? "default" : "pointer", padding: 2 }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveFile(i, 1)}
                  disabled={i === files.length - 1}
                  style={{ background: "none", border: "none", color: i === files.length - 1 ? colors.border : colors.muted, cursor: i === files.length - 1 ? "default" : "pointer", padding: 2 }}
                >
                  <ArrowDown size={14} />
                </button>

                <span style={{ flex: 1, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.name}
                </span>
                <span style={{ color: colors.muted, fontSize: 13, whiteSpace: "nowrap" }}>
                  {f.size.toLocaleString()} bytes
                </span>
                <button
                  onClick={() => removeFile(f.id)}
                  style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer", padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div
          style={{
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <label style={{ fontWeight: 500, display: "block", marginBottom: 10, fontSize: 15 }}>Separator</label>
          <div style={{ display: "flex", gap: 8, marginBottom: separator === "custom" ? 10 : 0 }}>
            {([
              ["none", "No separator"],
              ["newline", "Newline"],
              ["custom", "Custom string"],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSeparator(val)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: `1px solid ${separator === val ? colors.primary : colors.border}`,
                  background: separator === val ? colors.primary : colors.bg,
                  color: colors.text,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: separator === val ? 500 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {separator === "custom" && (
            <input
              value={customSep}
              onChange={(e) => setCustomSep(e.target.value)}
              placeholder="Enter separator string"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: colors.bg,
                color: colors.text,
                fontSize: 15,
                boxSizing: "border-box",
                marginTop: 10,
              }}
            />
          )}
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={mergeFiles}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            background: colors.primary,
            color: colors.text,
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          <Zap size={16} /> Merge Files
        </button>
      )}

      {result && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <label style={{ fontSize: 15, fontWeight: 500 }}>Result ({result.length.toLocaleString()} chars)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: copied ? '#22C55E' : colors.input,
                  color: copied ? '#fff' : colors.text,
                  border: `1px solid ${copied ? '#22C55E' : colors.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={saveResult}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: colors.primary,
                  color: colors.text,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>
          <div
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: 16,
              fontSize: 15,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxHeight: 300,
              overflow: "auto",
              color: colors.muted,
              fontFamily: 'monospace',
            }}
          >
            {result.length > 500 ? result.slice(0, 500) + "\n... (truncated)" : result}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 13, color: colors.muted }}>
            <span>{files.length} files merged</span>
            <span>|</span>
            <span>{result.length.toLocaleString()} characters</span>
            <span>|</span>
            <span>{new Blob([result]).size.toLocaleString()} bytes</span>
          </div>
        </div>
      )}
    </div>
  );
}
