import { useState, useMemo } from 'react';
import { FolderOpen, Zap, FileText, Folder, Check, X, AlertTriangle } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

type RenameMode = 'find-replace' | 'regex' | 'prefix-suffix' | 'numbering' | 'case';

interface FileEntry {
  name: string;
  path: string;
  size: number;
}

interface RenameResult {
  oldName: string;
  newName: string;
  path: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.substring(dot) : '';
}

function getNameWithoutExt(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.substring(0, dot) : name;
}

function applyCase(str: string, caseType: string): string {
  switch (caseType) {
    case 'upper':
      return str.toUpperCase();
    case 'lower':
      return str.toLowerCase();
    case 'title':
      return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    case 'sentence':
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    case 'camel':
      return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());
    case 'pascal':
      return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase());
    default:
      return str;
  }
}

export function BatchFileRename() {
  const [dirPath, setDirPath] = useState('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RenameMode>('find-replace');
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [numStart, setNumStart] = useState(1);
  const [numPadding, setNumPadding] = useState(3);
  const [caseType, setCaseType] = useState('upper');
  const [renaming, setRenaming] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const colors = useThemeColors();

  const handleSelectFolder = async () => {
    const path = await window.api.openFolder();
    if (path) {
      setDirPath(path);
      setLoading(true);
      setResult(null);
      try {
        const fileList = await window.api.listFiles(path);
        setFiles(fileList);
      } catch (err) {
        console.error('Failed to list files:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const preview: RenameResult[] = useMemo(() => {
    return files.map((file) => {
      const ext = getExtension(file.name);
      const base = getNameWithoutExt(file.name);
      let newBase = base;

      try {
        switch (mode) {
          case 'find-replace':
            if (findStr) {
              newBase = base.split(findStr).join(replaceStr);
            }
            break;
          case 'regex':
            if (regexPattern) {
              const regex = new RegExp(regexPattern, regexFlags);
              newBase = base.replace(regex, replaceStr);
            }
            break;
          case 'prefix-suffix':
            newBase = prefix + base + suffix;
            break;
          case 'numbering':
            newBase = base + '_' + String(files.indexOf(file) + numStart).padStart(numPadding, '0');
            break;
          case 'case':
            newBase = applyCase(base, caseType);
            break;
        }
      } catch {
        newBase = base;
      }

      return {
        oldName: file.name,
        newName: newBase + ext,
        path: file.path,
      };
    });
  }, [files, mode, findStr, replaceStr, regexPattern, regexFlags, prefix, suffix, numStart, numPadding, caseType]);

  const changedCount = preview.filter((p) => p.oldName !== p.newName).length;

  const handleRename = async () => {
    const renames = preview
      .filter((p) => p.oldName !== p.newName)
      .map((p) => ({ from: p.path, to: p.path.replace(p.oldName, p.newName) }));

    if (renames.length === 0) return;

    setRenaming(true);
    setResult(null);
    try {
      const res = await window.api.batchRename(renames);
      setResult(res);
      if (res.success > 0) {
        const path = dirPath;
        const fileList = await window.api.listFiles(path);
        setFiles(fileList);
      }
    } catch (err) {
      console.error('Failed to rename:', err);
    } finally {
      setRenaming(false);
    }
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <FileText size={28} color={colors.accent} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Batch File Rename</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, marginBottom: 32 }}>
        Rename multiple files at once with pattern matching, regex, numbering, and case changes
      </p>

      <button
        onClick={handleSelectFolder}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 28px',
          backgroundColor: colors.accent,
          color: colors.text,
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: 32,
        }}
      >
        <FolderOpen size={16} />
        Select Folder
      </button>

      {dirPath && (
        <div
          style={{
            backgroundColor: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 15, color: colors.text, fontWeight: 500 }}>
            <Folder size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            {dirPath}
          </div>
          <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            {files.length} file{files.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}

      {files.length > 0 && (
        <>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Rename Mode</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {([
                { id: 'find-replace', label: 'Find & Replace' },
                { id: 'regex', label: 'Regex' },
                { id: 'prefix-suffix', label: 'Prefix / Suffix' },
                { id: 'numbering', label: 'Numbering' },
                { id: 'case', label: 'Case Change' },
              ] as { id: RenameMode; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: mode === m.id ? colors.accent : colors.input,
                    color: mode === m.id ? colors.text : colors.textSecondary,
                    border: `1px solid ${mode === m.id ? colors.accent : colors.border}`,
                    borderRadius: 8,
                    fontSize: 15,
                    cursor: 'pointer',
                    fontWeight: mode === m.id ? 500 : 400,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'find-replace' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Find</label>
                <input
                  type="text"
                  value={findStr}
                  onChange={(e) => setFindStr(e.target.value)}
                  placeholder="Text to find..."
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Replace</label>
                <input
                  type="text"
                  value={replaceStr}
                  onChange={(e) => setReplaceStr(e.target.value)}
                  placeholder="Replace with..."
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {mode === 'regex' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Regex Pattern</label>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="e.g. ^(\d+)"
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Flags</label>
                  <input
                    type="text"
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    placeholder="g"
                    style={{
                      width: 80,
                      padding: 14,
                      backgroundColor: colors.input,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 10,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Replace With</label>
                  <input
                    type="text"
                    value={replaceStr}
                    onChange={(e) => setReplaceStr(e.target.value)}
                    placeholder="$1"
                    style={{
                      width: '100%',
                      padding: 14,
                      backgroundColor: colors.input,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 10,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'prefix-suffix' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g. IMG_"
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="e.g. _final"
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {mode === 'numbering' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Start Number</label>
                <input
                  type="number"
                  min={0}
                  value={numStart}
                  onChange={(e) => setNumStart(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Zero Padding</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={numPadding}
                  onChange={(e) => setNumPadding(parseInt(e.target.value, 10) || 1)}
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {mode === 'case' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Case Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'upper', label: 'UPPER CASE' },
                  { id: 'lower', label: 'lower case' },
                  { id: 'title', label: 'Title Case' },
                  { id: 'sentence', label: 'Sentence case' },
                  { id: 'camel', label: 'camelCase' },
                  { id: 'pascal', label: 'PascalCase' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCaseType(c.id)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: caseType === c.id ? colors.accent : colors.input,
                      color: caseType === c.id ? colors.text : colors.textSecondary,
                      border: `1px solid ${caseType === c.id ? colors.accent : colors.border}`,
                      borderRadius: 8,
                      fontSize: 15,
                      cursor: 'pointer',
                      fontWeight: caseType === c.id ? 500 : 400,
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
                Preview ({changedCount} file{changedCount !== 1 ? 's' : ''} will be renamed)
              </label>
              <button
                onClick={handleRename}
                disabled={changedCount === 0 || renaming}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  backgroundColor: changedCount > 0 && !renaming ? colors.accent : colors.input,
                  color: changedCount > 0 && !renaming ? colors.text : colors.textSecondary,
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: changedCount > 0 && !renaming ? 'pointer' : 'not-allowed',
                }}
              >
                <Zap size={16} />
                {renaming ? 'Renaming...' : 'Rename All'}
              </button>
            </div>

            <div
              style={{
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                overflow: 'hidden',
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, backgroundColor: colors.input }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, width: '40%' }}>Original</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, width: '40%' }}>New Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, width: '20%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => {
                    const changed = p.oldName !== p.newName;
                    return (
                      <tr
                        key={p.path}
                        style={{ borderBottom: i < preview.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 15 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={16} color={colors.textSecondary} />
                            <span style={{ color: colors.text }}>{p.oldName}</span>
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 15 }}>
                          <span style={{ color: changed ? colors.accent : colors.textSecondary, fontWeight: changed ? 500 : 400 }}>
                            {p.newName}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 13,
                              fontWeight: 500,
                              background: changed ? 'rgba(37,99,235,0.15)' : 'rgba(148,163,184,0.1)',
                              color: changed ? colors.accent : colors.textSecondary,
                            }}
                          >
                            {changed ? 'Will Change' : 'No Change'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 13, color: colors.textSecondary }}>
            <span>Total: {files.length} files</span>
            <span>|</span>
            <span>{changedCount} to rename</span>
            <span>|</span>
            <span>{formatBytes(files.reduce((a, f) => a + f.size, 0))}</span>
          </div>
        </>
      )}

      {loading && (
        <div style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 48, textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${colors.border}`,
              borderTopColor: colors.accent,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: 15 }}>Scanning folder...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <div
          style={{
            background: result.failed === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result.failed === 0 ? '#22C55E' : '#EF4444'}`,
            borderRadius: 10,
            padding: 20,
            marginTop: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {result.failed === 0 ? (
              <Check size={20} color="#22C55E" />
            ) : (
              <AlertTriangle size={20} color="#EF4444" />
            )}
            <span style={{ fontWeight: 500, fontSize: 15 }}>
              {result.failed === 0
                ? `Successfully renamed ${result.success} file${result.success !== 1 ? 's' : ''}`
                : `Renamed ${result.success}, failed ${result.failed}`}
            </span>
          </div>
          {result.errors.length > 0 && (
            <div style={{ fontSize: 13, color: '#EF4444', marginTop: 8 }}>
              {result.errors.slice(0, 5).map((e, i) => (
                <div key={i}>{e}</div>
              ))}
              {result.errors.length > 5 && <div>...and {result.errors.length - 5} more errors</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
