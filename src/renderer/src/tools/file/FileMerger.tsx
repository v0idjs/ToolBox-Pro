import { useState, useRef } from "react";
import { FolderOpen, Merge, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeColors = useThemeColors();
  const colors = {
    bg: themeColors.bg,
    card: themeColors.card,
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

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div style={{ color: colors.text, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>File Merger</h1>

      {/* Load button */}
      <button
        onClick={loadFiles}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px",
          background: colors.primary,
          color: colors.text,
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        <FolderOpen size={16} /> Open Files
      </button>

      {/* File list */}
      {files.length > 0 && (
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>{files.length} file(s) loaded</span>
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
                  padding: "8px 12px",
                  background: colors.bg,
                  borderRadius: 6,
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

                <span style={{ flex: 1, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.name}
                </span>
                <span style={{ color: colors.muted, fontSize: 12, whiteSpace: "nowrap" }}>
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

      {/* Separator options */}
      {files.length > 0 && (
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Separator</label>
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
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1px solid ${separator === val ? colors.primary : colors.border}`,
                  background: separator === val ? colors.primary : colors.bg,
                  color: colors.text,
                  cursor: "pointer",
                  fontSize: 13,
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
                padding: "8px 12px",
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                background: colors.bg,
                color: colors.text,
                fontSize: 13,
                boxSizing: "border-box",
                marginTop: 8,
              }}
            />
          )}
        </div>
      )}

      {/* Merge button */}
      {files.length > 0 && (
        <button
          onClick={mergeFiles}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: colors.primary,
            color: colors.text,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          <Merge size={16} /> Merge Files
        </button>
      )}

      {/* Result preview */}
      {result && (
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Preview ({result.length.toLocaleString()} chars)</span>
            <button
              onClick={saveResult}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: colors.primary,
                color: colors.text,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Save size={14} /> Save
            </button>
          </div>
          <pre
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: 12,
              fontSize: 13,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxHeight: 300,
              overflow: "auto",
              color: colors.muted,
              margin: 0,
            }}
          >
            {result.length > 500 ? result.slice(0, 500) + "\n... (truncated)" : result}
          </pre>
        </div>
      )}
    </div>
  );
}
