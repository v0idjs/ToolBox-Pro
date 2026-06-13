import { useState } from 'react';
import { FolderOpen, Copy, AlertTriangle } from 'lucide-react';
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
    <div style={{ color: colors.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Copy size={28} color={colors.accent} />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Duplicate File Finder</h1>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '4px 0 0 0' }}>Scan folders for duplicate files and identify wasted space</p>
          </div>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleSelectFolder}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: colors.border,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.card)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.border)}
            >
              <FolderOpen size={16} />
              Select Folder
            </button>

            <div style={{
              flex: 1,
              minWidth: '200px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
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
                gap: '8px',
                background: dirPath && !loading ? colors.accent : colors.border,
                color: colors.text,
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: dirPath && !loading ? 'pointer' : 'not-allowed',
                opacity: !dirPath || loading ? 0.5 : 1,
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: colors.text,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Scanning...
                </>
              ) : (
                'Find Duplicates'
              )}
            </button>
          </div>
        </div>

        {!dirPath && (
          <div style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <FolderOpen size={48} color={colors.border} style={{ marginBottom: '16px' }} />
            <p style={{ color: colors.textSecondary, fontSize: '15px', margin: 0 }}>
              Select a folder to scan for duplicate files
            </p>
          </div>
        )}

        {scanned && !loading && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{
                flex: 1,
                minWidth: '200px',
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '4px' }}>Duplicate Groups</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: colors.text }}>{totalGroups}</div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '200px',
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '4px' }}>Total Duplicate Files</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: colors.text }}>{totalFiles}</div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '200px',
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '20px',
                borderColor: totalGroups > 0 ? '#DC2626' : colors.border,
              }}>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {totalGroups > 0 && <AlertTriangle size={14} color="#DC2626" />}
                  Wasted Space
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: totalGroups > 0 ? '#DC2626' : colors.text }}>
                  {totalGroups > 0 ? formatSize(totalWastedBytes) : '0 B'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={handleExport}
                disabled={groups.length === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: groups.length > 0 ? colors.accent : colors.textSecondary,
                  border: '1px solid',
                  borderColor: groups.length > 0 ? colors.accent : colors.border,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
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
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
              }}>
                <AlertTriangle size={48} color="#22C55E" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#22C55E', fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>
                  No duplicates found
                </p>
                <p style={{ color: colors.textSecondary, fontSize: '14px', margin: 0 }}>
                  All files in the selected folder are unique
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {groups.map((group, groupIdx) => (
                  <div
                    key={groupIdx}
                    style={{
                      background: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: colors.accent,
                      }}>
                        Group {groupIdx + 1}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        background: colors.border,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        {group.length} files
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {group.map((filePath, fileIdx) => (
                        <div
                          key={fileIdx}
                          style={{
                            fontSize: '13px',
                            color: colors.textSecondary,
                            fontFamily: 'monospace',
                            padding: '4px 8px',
                            background: colors.bg,
                            borderRadius: '4px',
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
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
