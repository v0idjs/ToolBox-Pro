import { useState } from 'react'
import { FolderOpen, CopyPlus, AlertTriangle, Zap, Download } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel } from '@/components/ui'

export function DuplicateFileFinder() {
  const [dirPath, setDirPath] = useState('')
  const [groups, setGroups] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const colors = useThemeColors()

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="Duplicate File Finder"
        description="Find duplicate files by content hash in a directory"
        category="file"
        icon={CopyPlus}
        serial="duplicate-finder"
      />

      <Card>
        <SectionLabel>Folder</SectionLabel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
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
            onClick={handleFindDuplicates}
            disabled={!dirPath || loading}
            isLoading={loading}
          >
            {loading ? 'Scanning...' : 'Find Duplicates'}
          </Button>
        </div>
      </Card>

      {!dirPath && (
        <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
          <FolderOpen size={44} color={colors.textFaint} style={{ marginBottom: 14 }} />
          <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>
            Select a folder to scan for duplicate files
          </p>
        </Card>
      )}

      {scanned && !loading && (
        <>
          <Card>
            <SectionLabel hint={dirPath}>Scan results</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', columnGap: 20, rowGap: 8, flexWrap: 'wrap' }}>
              {[
                { value: String(totalGroups), label: 'Duplicate groups', color: colors.text },
                { value: String(totalFiles), label: 'Duplicate files', color: colors.text },
                {
                  value: totalGroups > 0 ? formatSize(totalWastedBytes) : '0 B',
                  label: 'Wasted space',
                  color: totalGroups > 0 ? colors.error : colors.text
                }
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
                  {i > 0 && <span aria-hidden style={{ width: 1, height: 14, backgroundColor: colors.border }} />}
                  {item.color === colors.error && i === 2 && totalGroups > 0 && (
                    <AlertTriangle size={13} color={colors.error} />
                  )}
                  <span
                    className="tb-mono"
                    style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.02em', color: item.color }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 10.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: colors.textFaint
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExport} disabled={groups.length === 0}>
              Export Report
            </Button>
          </div>

          {groups.length === 0 ? (
            <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
              <AlertTriangle size={40} color={colors.success} style={{ marginBottom: 14 }} />
              <p style={{ color: colors.success, fontSize: 15, fontWeight: 600, margin: '0 0 4px 0' }}>
                No duplicates found
              </p>
              <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>
                All files in the selected folder are unique
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groups.map((group, groupIdx) => (
                <Card key={groupIdx}>
                  <SectionLabel hint={`${group.length} files`}>Group {groupIdx + 1}</SectionLabel>
                  <div>
                    {group.map((filePath, fileIdx) => (
                      <div
                        key={fileIdx}
                        className="tb-mono"
                        title={filePath}
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          padding: '8px 4px',
                          borderBottom: fileIdx < group.length - 1 ? `1px solid ${colors.border}` : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {filePath}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
