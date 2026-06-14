import { useState } from 'react';
import { FolderOpen, Copy, AlertTriangle, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function DuplicateFileFinder() {
  const [dirPath, setDirPath] = useState('');
  const [groups, setGroups] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const colors = useThemeColors();

  const handleSelectFolder = async () => {
    const path = await window.api.openFolder();
    if (path) {
      setDirPath(path);
      setGroups([]);
      setScanned(false);
    }
  };

  const handleFindDuplicates = async () => {
    if (!dirPath) return;
    setLoading(true);
    try {
      const result = await window.api.findDuplicates(dirPath);
      setGroups(result);
      setScanned(true);
    } catch {
      setGroups([]);
      setScanned(true);
    } finally {
      setLoading(false);
    }
  };

  const totalGroups = groups.length;
  const totalFiles = groups.reduce((sum, g) => sum + g.length, 0);

  const totalWastedBytes = 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  };

  const handleExport = () => {
    const lines: string[] = [
      `Duplicate Files Report`,
      `Folder: ${dirPath}`,
      `Generated: ${new Date().toISOString()}`,
      `Total duplicate groups: ${totalGroups}`,
      `Total duplicate files: ${totalFiles}`,
      '',
      '---',
      '',
    ];

    groups.forEach((group, i) => {
      lines.push(`Group ${i + 1}:`);
      group.forEach((file) => {
        lines.push(`  ${file}`);
      });
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'duplicates-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Copy size={28} color={colors.accent} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Duplicate File Finder</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, marginBottom: 32 }}>
        Scan folders for duplicate files and identify wasted space
      </p>

      <div style={{ background: colors.input, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSelectFolder}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: colors.border,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.input)}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.border)}
          >
            <FolderOpen size={16} />
            Select Folder
          </button>

          <div style={{
            flex: 1,
            minWidth: 200,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 15,
            color: dirPath ? colors.text : colors.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {dirPath || 'No folder selected'}
          </div>

          <button
            onClick={handleFindDuplicates}
            disabled={!dirPath || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: dirPath && !loading ? colors.accent : colors.input,
              color: colors.text,
              border: 'none',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 500,
              cursor: dirPath && !loading ? 'pointer' : 'not-allowed',
              opacity: !dirPath || loading ? 0.5 : 1,
              transition: 'background 0.15s',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: colors.text,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Scanning...
              </>
            ) : (
              <>
                <Zap size={16} />
                Find Duplicates
              </>
            )}
          </button>
        </div>
      </div>

      {!dirPath && (
        <div style={{
          background: colors.input,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <FolderOpen size={48} color={colors.border} style={{ marginBottom: 16 }} />
          <p style={{ color: colors.textSecondary, fontSize: 15, margin: 0 }}>
            Select a folder to scan for duplicate files
          </p>
        </div>
      )}

      {scanned && !loading && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{
              flex: 1,
              minWidth: 200,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: 20,
            }}>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Duplicate Groups</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{totalGroups}</div>
            </div>
            <div style={{
              flex: 1,
              minWidth: 200,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: 20,
            }}>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Total Duplicate Files</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{totalFiles}</div>
            </div>
            <div style={{
              flex: 1,
              minWidth: 200,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: 20,
              borderColor: totalGroups > 0 ? '#DC2626' : colors.border,
            }}>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {totalGroups > 0 && <AlertTriangle size={14} color="#DC2626" />}
                Wasted Space
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: totalGroups > 0 ? '#DC2626' : colors.text }}>
                {totalGroups > 0 ? formatSize(totalWastedBytes) : '0 B'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              onClick={handleExport}
              disabled={groups.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: groups.length > 0 ? colors.accent : colors.textSecondary,
                border: '1px solid',
                borderColor: groups.length > 0 ? colors.accent : colors.border,
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 500,
                cursor: groups.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (groups.length > 0) e.currentTarget.style.background = `${colors.accent}1A`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Export Report
            </button>
          </div>

          {groups.length === 0 ? (
            <div style={{
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <AlertTriangle size={48} color="#22C55E" style={{ marginBottom: 16 }} />
              <p style={{ color: '#22C55E', fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>
                No duplicates found
              </p>
              <p style={{ color: colors.textSecondary, fontSize: 15, margin: 0 }}>
                All files in the selected folder are unique
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groups.map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  style={{
                    background: colors.input,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: colors.accent,
                    }}>
                      Group {groupIdx + 1}
                    </span>
                    <span style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      background: colors.border,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {group.length} files
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {group.map((filePath, fileIdx) => (
                      <div
                        key={fileIdx}
                        style={{
                          fontSize: 15,
                          color: colors.textSecondary,
                          fontFamily: 'monospace',
                          padding: '6px 10px',
                          background: colors.bg,
                          borderRadius: 6,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={filePath}
                      >
                        {filePath}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
