import { useState } from 'react';
import { FolderOpen, HardDrive, File, Folder } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface FileEntry {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 2 : 0);
  return `${size} ${units[i]}`;
}

export function FolderSizeAnalyzer() {
  const [dirPath, setDirPath] = useState('');
  const [results, setResults] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const colors = useThemeColors();

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
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <HardDrive size={28} color={colors.accent} />
          <h1 style={{ color: colors.text, margin: 0, fontSize: '24px', fontWeight: 600 }}>Folder Size Analyzer</h1>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleSelectFolder}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              <FolderOpen size={16} /> Select Folder
            </button>
            <div
              style={{
                flex: 1,
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: dirPath ? colors.text : colors.textSecondary,
                fontSize: '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {dirPath || 'No folder selected'}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!dirPath || loading}
              style={{
                background: dirPath && !loading ? colors.accent : colors.border,
                border: 'none',
                color: colors.text,
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: dirPath && !loading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 500,
                opacity: dirPath && !loading ? 1 : 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${colors.border}`,
                borderTopColor: colors.accent,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: colors.textSecondary, margin: 0 }}>Scanning folder...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {analyzed && !loading && (
          <>
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Size</div>
                <div style={{ color: colors.text, fontSize: '20px', fontWeight: 600 }}>{formatSize(totalSize)}</div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Files</div>
                <div style={{ color: colors.text, fontSize: '20px', fontWeight: 600 }}>{fileCount}</div>
              </div>
              <div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Folders</div>
                <div style={{ color: colors.text, fontSize: '20px', fontWeight: 600 }}>{folderCount}</div>
              </div>
            </div>

            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Name</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Size</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, width: '100px' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((entry, i) => (
                    <tr
                      key={entry.path}
                      style={{ borderBottom: i < results.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                    >
                      <td style={{ padding: '10px 16px', color: colors.text, fontSize: '14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {entry.isDirectory ? <Folder size={16} color={colors.accent} /> : <File size={16} color={colors.textSecondary} />}
                          {entry.name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: colors.textSecondary, fontSize: '14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatSize(entry.size)}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: entry.isDirectory ? 'rgba(37,99,235,0.15)' : 'rgba(148,163,184,0.15)',
                            color: entry.isDirectory ? colors.accent : colors.textSecondary,
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
          </>
        )}

        {analyzed && !loading && results.length === 0 && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: colors.textSecondary, margin: 0 }}>No files or folders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
