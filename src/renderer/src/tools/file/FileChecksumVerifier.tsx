import { useState, useCallback } from 'react'
import { Zap, Check, X, ShieldCheck, FolderOpen } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

type Algorithm = 'md5' | 'sha1' | 'sha256'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function FileChecksumVerifier() {
  const [filePath, setFilePath] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [algorithm, setAlgorithm] = useState<Algorithm>('sha256')
  const [expectedHash, setExpectedHash] = useState('')
  const [computedHash, setComputedHash] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<'match' | 'mismatch' | null>(null)
  const [dragging, setDragging] = useState(false)
  const colors = useThemeColors()

  const handleFile = async (path: string, name: string) => {
    setFilePath(path);
    setFileName(name);
    setComputedHash('');
    setResult(null);
    try {
      const { size } = await window.api.computeFileHash(path, 'sha256');
      setFileSize(size);
    } catch {}
  };

  const handleOpenFile = async () => {
    try {
      const result = await window.api.openFile();
      if (result) {
        await handleFile(result.filePath, result.name);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const path = (file as unknown as { path?: string }).path || '';
      if (path) {
        handleFile(path, file.name);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleVerify = async () => {
    if (!filePath) return;
    setVerifying(true);
    setComputedHash('');
    setResult(null);
    try {
      const { hash } = await window.api.computeFileHash(filePath, algorithm);
      setComputedHash(hash);
      if (expectedHash.trim()) {
        setResult(hash.toLowerCase() === expectedHash.trim().toLowerCase() ? 'match' : 'mismatch');
      }
    } catch (err) {
      console.error('Failed to compute hash:', err);
    } finally {
      setVerifying(false);
    }
  };

  const algorithms: { id: Algorithm; label: string; bits: string }[] = [
    { id: 'md5', label: 'MD5', bits: '128-bit' },
    { id: 'sha1', label: 'SHA-1', bits: '160-bit' },
    { id: 'sha256', label: 'SHA-256', bits: '256-bit' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ToolHeader
        name="File Checksum Verifier"
        description="Verify file integrity by comparing computed hash with expected checksum"
        category="file"
        icon={ShieldCheck}
        serial="file-checksum"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleOpenFile}
        style={{
          border: `1px dashed ${dragging ? colors.accent : colors.borderStrong}`,
          borderRadius: 'var(--tb-radius-panel)',
          background: dragging ? colors.accentTint : colors.raised,
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease',
        }}
      >
        <FolderOpen size={40} color={dragging ? colors.accent : colors.textSecondary} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14.5, color: colors.text, fontWeight: 600, marginBottom: 4 }}>
          {fileName || 'Drop a file here or click to browse'}
        </div>
        <div className="tb-mono" style={{ fontSize: 12, color: colors.textSecondary }}>
          {fileName ? formatBytes(fileSize) : 'Any file type supported'}
        </div>
      </div>

      <Card>
        <SectionLabel>Algorithm</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {algorithms.map((a) => (
            <Button
              key={a.id}
              variant="secondary"
              onClick={() => setAlgorithm(a.id)}
              style={
                algorithm === a.id
                  ? { backgroundColor: colors.accentTint, borderColor: colors.accent }
                  : undefined
              }
            >
              {a.label}
              <span style={{ fontFamily: 'var(--tb-font-mono)', fontSize: 11, opacity: 0.7 }}>{a.bits}</span>
            </Button>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Input
            type="text"
            value={expectedHash}
            onChange={(e) => {
              setExpectedHash(e.target.value);
              setResult(null);
            }}
            placeholder="Paste expected hash here to verify..."
            label="Expected hash (optional)"
            className="tb-field tb-mono"
            style={{ width: '100%', fontSize: 12.5 }}
          />
        </div>
      </Card>

      <div>
        <Button
          variant="primary"
          size="lg"
          icon={Zap}
          onClick={handleVerify}
          disabled={!filePath || verifying}
          isLoading={verifying}
        >
          {verifying ? 'Computing...' : 'Compute Hash'}
        </Button>
      </div>

      {computedHash && (
        <Card>
          <SectionLabel hint={`${algorithms.find((a) => a.id === algorithm)?.label} · ${formatBytes(fileSize)}`}>
            Computed hash
          </SectionLabel>
          <div
            className="tb-mono"
            style={{
              backgroundColor: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-ctl)',
              padding: 14,
              fontSize: 12.5,
              lineHeight: 1.6,
              wordBreak: 'break-all',
              color: colors.text,
              marginBottom: 12,
            }}
          >
            {computedHash}
          </div>
          <p
            className="tb-mono"
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            File: {fileName}
          </p>
        </Card>
      )}

      {result && (
        <Card style={{ borderColor: result === 'match' ? colors.success : colors.error }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {result === 'match' ? (
              <Check size={18} color={colors.success} />
            ) : (
              <X size={18} color={colors.error} />
            )}
            <span style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>
              {result === 'match'
                ? 'Checksum verified — file is intact'
                : 'Checksum mismatch — file may be corrupted or modified'}
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
