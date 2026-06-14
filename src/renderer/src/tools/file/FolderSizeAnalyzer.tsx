import { useState } from 'react';
import { FolderOpen, HardDrive, File, Folder, Zap } from 'lucide-react';
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
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <HardDrive size={28} color={colors.accent} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Folder Size Analyzer</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, marginBottom: 32 }}>
        Analyze disk usage and find the largest files and folders
      </p>

      <div style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleSelectFolder}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: colors.card,
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              padding: '10px 20px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
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
              borderRadius: 10,
              padding: '12px 16px',
              color: dirPath ? colors.text : colors.textSecondary,
              fontSize: 15,
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
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: dirPath && !loading ? colors.accent : colors.input,
              border: 'none',
              color: colors.text,
              padding: '14px 28px',
              borderRadius: 10,
              cursor: dirPath && !loading ? 'pointer' : 'not-allowed',
              fontSize: 15,
              fontWeight: 500,
              opacity: dirPath && !loading ? 1 : 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={16} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

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

      {analyzed && !loading && (
        <>
          <div style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 32 }}>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Total Size</div>
              <div style={{ color: colors.text, fontSize: 22, fontWeight: 600 }}>{formatSize(totalSize)}</div>
            </div>
            <div style={{ color: colors.border, alignSelf: 'center', fontSize: 20 }}>|</div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Files</div>
              <div style={{ color: colors.text, fontSize: 22, fontWeight: 600 }}>{fileCount}</div>
            </div>
            <div style={{ color: colors.border, alignSelf: 'center', fontSize: 20 }}>|</div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Folders</div>
              <div style={{ color: colors.text, fontSize: 22, fontWeight: 600 }}>{folderCount}</div>
            </div>
          </div>

          <div style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Name</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Size</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500, width: '100px' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {results.map((entry, i) => (
                  <tr
                    key={entry.path}
                    style={{ borderBottom: i < results.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                  >
                    <td style={{ padding: '12px 16px', color: colors.text, fontSize: 15 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {entry.isDirectory ? <Folder size={16} color={colors.accent} /> : <File size={16} color={colors.textSecondary} />}
                        {entry.name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.textSecondary, fontSize: 15, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatSize(entry.size)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 15 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 13,
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
        <div style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 48, textAlign: 'center' }}>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: 15 }}>No files or folders found.</p>
        </div>
      )}
    </div>
  );
}
