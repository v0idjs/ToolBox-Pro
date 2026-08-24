import { useState, useMemo } from 'react'
import { FolderOpen, Zap, FileText, Folder, PenLine, Check, AlertTriangle } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

type RenameMode = 'find-replace' | 'regex' | 'prefix-suffix' | 'numbering' | 'case'

interface FileEntry {
  name: string
  path: string
  size: number
}

interface RenameResult {
  oldName: string
  newName: string
  path: string
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
  const [dirPath, setDirPath] = useState('')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<RenameMode>('find-replace')
  const [findStr, setFindStr] = useState('')
  const [replaceStr, setReplaceStr] = useState('')
  const [regexPattern, setRegexPattern] = useState('')
  const [regexFlags, setRegexFlags] = useState('g')
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [numStart, setNumStart] = useState(1)
  const [numPadding, setNumPadding] = useState(3)
  const [caseType, setCaseType] = useState('upper')
  const [renaming, setRenaming] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const colors = useThemeColors()

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

  const modes: { id: RenameMode; label: string }[] = [
    { id: 'find-replace', label: 'Find & Replace' },
    { id: 'regex', label: 'Regex' },
    { id: 'prefix-suffix', label: 'Prefix / Suffix' },
    { id: 'numbering', label: 'Numbering' },
    { id: 'case', label: 'Case Change' },
  ];

  const caseTypes: { id: string; label: string }[] = [
    { id: 'upper', label: 'UPPER CASE' },
    { id: 'lower', label: 'lower case' },
    { id: 'title', label: 'Title Case' },
    { id: 'sentence', label: 'Sentence case' },
    { id: 'camel', label: 'camelCase' },
    { id: 'pascal', label: 'PascalCase' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Batch File Rename"
        description="Rename multiple files with pattern matching, regex, numbering, and case changes"
        category="file"
        icon={PenLine}
        serial="batch-rename"
      />

      <Card>
        <SectionLabel hint={dirPath ? `${files.length} file${files.length !== 1 ? 's' : ''} found` : undefined}>
          Folder
        </SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={FolderOpen} onClick={handleSelectFolder}>
            Select Folder
          </Button>
          {dirPath && (
            <span className="tb-mono" style={{ fontSize: 12, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dirPath}
            </span>
          )}
        </div>
      </Card>

      {loading && (
        <Card style={{ padding: 48, textAlign: 'center' }}>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `2px solid ${colors.border}`,
              borderTopColor: colors.accent,
              animation: 'tb-spin 0.7s linear infinite',
              marginBottom: 16,
            }}
          />
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: 14 }}>Scanning folder...</p>
        </Card>
      )}

      {files.length > 0 && !loading && (
        <>
          <Card>
            <SectionLabel>Rename mode</SectionLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {modes.map((m) => (
                <Button
                  key={m.id}
                  variant="secondary"
                  onClick={() => setMode(m.id)}
                  style={
                    mode === m.id
                      ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
                      : undefined
                  }
                >
                  {m.label}
                </Button>
              ))}
            </div>

            {mode === 'find-replace' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input type="text" value={findStr} onChange={(e) => setFindStr(e.target.value)} placeholder="Text to find..." label="Find" />
                <Input type="text" value={replaceStr} onChange={(e) => setReplaceStr(e.target.value)} placeholder="Replace with..." label="Replace" />
              </div>
            )}

            {mode === 'regex' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <Input type="text" value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)} placeholder="e.g. ^(\d+)" label="Regex pattern" />
                <div style={{ display: 'flex', gap: 12 }}>
                  <Input type="text" value={regexFlags} onChange={(e) => setRegexFlags(e.target.value)} placeholder="g" label="Flags" style={{ width: 80 }} />
                  <Input type="text" value={replaceStr} onChange={(e) => setReplaceStr(e.target.value)} placeholder="$1" label="Replace with" />
                </div>
              </div>
            )}

            {mode === 'prefix-suffix' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. IMG_" label="Prefix" />
                <Input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. _final" label="Suffix" />
              </div>
            )}

            {mode === 'numbering' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input type="number" min={0} value={numStart} onChange={(e) => setNumStart(parseInt(e.target.value, 10) || 0)} label="Start number" />
                <Input type="number" min={1} max={10} value={numPadding} onChange={(e) => setNumPadding(parseInt(e.target.value, 10) || 1)} label="Zero padding" />
              </div>
            )}

            {mode === 'case' && (
              <div>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: colors.text, letterSpacing: '0.01em', marginBottom: 8 }}>
                  Case type
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {caseTypes.map((c) => (
                    <Button
                      key={c.id}
                      variant="secondary"
                      onClick={() => setCaseType(c.id)}
                      style={
                        caseType === c.id
                          ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
                          : undefined
                      }
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <SectionLabel hint={`${changedCount} file${changedCount !== 1 ? 's' : ''} will be renamed`}>
                Preview
              </SectionLabel>
              <Button
                variant="primary"
                size="lg"
                icon={Zap}
                onClick={handleRename}
                disabled={changedCount === 0 || renaming}
                isLoading={renaming}
              >
                {renaming ? 'Renaming...' : 'Rename All'}
              </Button>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderStrong}`, position: 'sticky', top: 0, backgroundColor: colors.card }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px 8px 4px', fontFamily: 'var(--tb-font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: colors.textFaint, width: '40%' }}>Original</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px 8px 4px', fontFamily: 'var(--tb-font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: colors.textFaint, width: '40%' }}>New name</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', fontFamily: 'var(--tb-font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: colors.textFaint }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => {
                    const changed = p.oldName !== p.newName;
                    return (
                      <tr key={p.path} style={{ borderBottom: i < preview.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                        <td style={{ padding: '9px 12px 9px 4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={13} color={colors.textFaint} />
                            <span className="tb-mono" style={{ fontSize: 12, color: colors.textSecondary }}>{p.oldName}</span>
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px 9px 4px' }}>
                          <span
                            className="tb-mono"
                            style={{ fontSize: 12, color: changed ? colors.accent : colors.textSecondary, fontWeight: changed ? 600 : 400 }}
                          >
                            {p.newName}
                          </span>
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: 'var(--tb-radius-ctl)',
                              fontFamily: 'var(--tb-font-mono)',
                              fontSize: 11,
                              fontWeight: 500,
                              background: changed ? colors.accentTint : 'transparent',
                              border: `1px solid ${changed ? colors.accent : colors.border}`,
                              color: changed ? colors.accent : colors.textFaint,
                            }}
                          >
                            {changed ? 'Will change' : 'No change'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p
              className="tb-mono"
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${colors.border}`,
                fontSize: 11,
                letterSpacing: '0.04em',
                color: colors.textFaint,
              }}
            >
              Total: {files.length} files · {changedCount} to rename ·{' '}
              {formatBytes(files.reduce((a, f) => a + f.size, 0))}
            </p>
          </Card>
        </>
      )}

      {result && (
        <Card
          style={{
            borderColor: result.failed === 0 ? colors.success : colors.error,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {result.failed === 0 ? (
                <Check size={18} color={colors.success} />
              ) : (
                <AlertTriangle size={18} color={colors.error} />
              )}
              <span style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>
                {result.failed === 0
                  ? `Successfully renamed ${result.success} file${result.success !== 1 ? 's' : ''}`
                  : `Renamed ${result.success}, failed ${result.failed}`}
              </span>
            </div>
            {result.errors.length > 0 && (
              <div className="tb-mono" style={{ fontSize: 12, lineHeight: 1.6, color: colors.error }}>
                {result.errors.slice(0, 5).map((e, i) => (
                  <div key={i}>{e}</div>
                ))}
                {result.errors.length > 5 && <div>...and {result.errors.length - 5} more errors</div>}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
