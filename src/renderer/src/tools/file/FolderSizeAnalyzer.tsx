import { useState } from 'react'
import { FolderOpen, HardDrive, File, Folder, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, StatStrip } from '@/components/ui'

interface FileEntry {
  name: string
  path: string
  size: number
  isDirectory: boolean
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 2 : 0);
  return `${size} ${units[i]}`;
}

export function FolderSizeAnalyzer() {
  const [dirPath, setDirPath] = useState('')
  const [results, setResults] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const colors = useThemeColors()

  const handleSelectFolder = async () => {
    const path = await window.api.openFolder();
    if (path) setDirPath(path);
  };

  const handleAnalyze = async () => {
    if (!dirPath) return;
    setLoading(true);
    setAnalyzed(false);
    try {
      const entries = await window.api.getFolderSize(dirPath);
      const sorted = [...entries].sort((a: FileEntry, b: FileEntry) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return b.size - a.size;
      });
      setResults(sorted);
      setAnalyzed(true);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSize = results.reduce((acc, e) => acc + e.size, 0);
  const fileCount = results.filter((e) => !e.isDirectory).length;
  const folderCount = results.filter((e) => e.isDirectory).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Folder Size Analyzer"
        description="Analyze folder contents and show file sizes"
        category="file"
        icon={HardDrive}
        serial="folder-size"
      />

      <Card>
        <SectionLabel>Folder</SectionLabel>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={FolderOpen} onClick={handleSelectFolder}>
            Select Folder
          </Button>
          <div
            className="tb-mono"
            style={{
              flex: 1,
              minWidth: 200,
              backgroundColor: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-ctl)',
              padding: '10px 12px',
              fontSize: 12,
              color: dirPath ? colors.text : colors.textFaint,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {dirPath || 'No folder selected'}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button
            variant="primary"
            size="lg"
            icon={Zap}
            onClick={handleAnalyze}
            disabled={!dirPath || loading}
            isLoading={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
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

      {analyzed && !loading && (
        <>
          <Card>
            <SectionLabel>Overview</SectionLabel>
            <StatStrip
              items={[
                { value: formatSize(totalSize), label: 'Total size' },
                { value: String(fileCount), label: 'Files' },
                { value: String(folderCount), label: 'Folders' },
              ]}
            />
          </Card>

          {results.length > 0 ? (
            <Card>
              <SectionLabel hint={`${results.length} entries`}>Contents</SectionLabel>
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.borderStrong}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px 8px 4px', fontFamily: 'var(--tb-font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: colors.textFaint }}>Name</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontFamily: 'var(--tb-font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: colors.textFaint }}>Size</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', fontFamily: 'var(--tb-font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: colors.textFaint }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((entry, i) => (
                      <tr key={entry.path} style={{ borderBottom: i < results.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                        <td style={{ padding: '9px 12px 9px 4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {entry.isDirectory ? <Folder size={14} color={colors.accent} /> : <File size={14} color={colors.textFaint} />}
                            <span className="tb-mono" style={{ fontSize: 12, color: colors.textSecondary }}>{entry.name}</span>
                          </span>
                        </td>
                        <td className="tb-mono" style={{ padding: '9px 12px', fontSize: 12.5, color: colors.textSecondary, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {formatSize(entry.size)}
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
                              background: entry.isDirectory ? colors.accentTint : 'transparent',
                              border: `1px solid ${entry.isDirectory ? colors.accent : colors.border}`,
                              color: entry.isDirectory ? colors.accent : colors.textFaint,
                            }}
                          >
                            {entry.isDirectory ? 'Folder' : 'File'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ color: colors.textSecondary, margin: 0, fontSize: 14 }}>No files or folders found.</p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
