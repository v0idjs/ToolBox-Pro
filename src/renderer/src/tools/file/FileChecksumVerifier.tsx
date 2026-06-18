import { useState, useRef, useCallback } from 'react';
import { FileText, Zap, Check, X, Shield, FolderOpen } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

type Algorithm = 'md5' | 'sha1' | 'sha256';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function FileChecksumVerifier() {
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [algorithm, setAlgorithm] = useState<Algorithm>('sha256');
  const [expectedHash, setExpectedHash] = useState('');
  const [computedHash, setComputedHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'match' | 'mismatch' | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = useThemeColors();

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
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Shield size={28} color={colors.accent} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>File Checksum Verifier</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, marginBottom: 32 }}>
        Verify file integrity by comparing computed hash with expected checksum
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleOpenFile}
        style={{
          border: `2px dashed ${dragging ? colors.accent : colors.border}`,
          borderRadius: 10,
          padding: 48,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragging ? `${colors.accent}10` : colors.input,
          transition: 'all 0.2s',
          marginBottom: 24,
        }}
      >
        <FolderOpen size={40} color={dragging ? colors.accent : colors.textSecondary} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 15, color: colors.text, fontWeight: 500, marginBottom: 4 }}>
          {fileName || 'Drop a file here or click to browse'}
        </div>
        <div style={{ fontSize: 13, color: colors.textSecondary }}>
          {fileName ? formatBytes(fileSize) : 'Any file type supported'}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const path = (file as unknown as { path?: string }).path || '';
              if (path) handleFile(path, file.name);
            }
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Algorithm</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {algorithms.map((a) => (
            <button
              key={a.id}
              onClick={() => setAlgorithm(a.id)}
              style={{
                padding: '10px 20px',
                backgroundColor: algorithm === a.id ? colors.accent : colors.input,
                color: algorithm === a.id ? colors.text : colors.textSecondary,
                border: `1px solid ${algorithm === a.id ? colors.accent : colors.border}`,
                borderRadius: 8,
                fontSize: 15,
                cursor: 'pointer',
                fontWeight: algorithm === a.id ? 500 : 400,
              }}
            >
              {a.label}
              <span style={{ fontSize: 12, marginLeft: 6, opacity: 0.7 }}>{a.bits}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Expected Hash (optional)</label>
        <input
          type="text"
          value={expectedHash}
          onChange={(e) => {
            setExpectedHash(e.target.value);
            setResult(null);
          }}
          placeholder="Paste expected hash here to verify..."
          style={{
            width: '100%',
            padding: 14,
            backgroundColor: colors.input,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: 'ui-monospace, monospace',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={!filePath || verifying}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 28px',
          backgroundColor: filePath && !verifying ? colors.accent : colors.input,
          color: filePath && !verifying ? colors.text : colors.textSecondary,
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 500,
          cursor: filePath && !verifying ? 'pointer' : 'not-allowed',
          marginBottom: 32,
        }}
      >
        <Zap size={16} />
        {verifying ? 'Computing...' : 'Compute Hash'}
      </button>

      {computedHash && (
        <div>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Computed Hash</label>
          <div
            style={{
              padding: 16,
              backgroundColor: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              fontFamily: 'ui-monospace, monospace',
              fontSize: 14,
              wordBreak: 'break-all',
              color: colors.text,
              marginBottom: 16,
            }}
          >
            {computedHash}
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: colors.textSecondary }}>
            <span>Algorithm: {algorithms.find((a) => a.id === algorithm)?.label}</span>
            <span>|</span>
            <span>File: {fileName}</span>
            <span>|</span>
            <span>{formatBytes(fileSize)}</span>
          </div>
        </div>
      )}

      {result && (
        <div
          style={{
            background: result === 'match' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result === 'match' ? '#22C55E' : '#EF4444'}`,
            borderRadius: 10,
            padding: 20,
            marginTop: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {result === 'match' ? (
              <Check size={20} color="#22C55E" />
            ) : (
              <X size={20} color="#EF4444" />
            )}
            <span style={{ fontWeight: 500, fontSize: 15 }}>
              {result === 'match'
                ? 'Checksum verified — file is intact'
                : 'Checksum mismatch — file may be corrupted or modified'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
