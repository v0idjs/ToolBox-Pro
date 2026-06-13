import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Minimize2, Image } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [compressedPreview, setCompressedPreview] = useState<string>('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = useThemeColors();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setOriginalFile(file);
    setCompressedPreview('');
    setCompressedBlob(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!originalFile) return;
    setCompressing(true);
    try {
      const img = new window.Image();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(originalFile);
      });
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = dataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0);

      const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas toBlob returned null'));
          },
          mimeType,
          outputFormat === 'jpeg' ? quality / 100 : undefined
        );
      });

      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
      const url = URL.createObjectURL(blob);
      setCompressedPreview(url);
      setCompressedBlob(blob);
    } catch {
      // compression failed
    }
    setCompressing(false);
  }, [originalFile, quality, outputFormat, compressedPreview]);

  const handleDownload = useCallback(() => {
    if (!compressedBlob || !originalFile) return;
    const ext = outputFormat === 'png' ? '.png' : '.jpg';
    const name = originalFile.name.replace(/\.[^.]+$/, '') + '_compressed' + ext;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [compressedBlob, originalFile, outputFormat]);

  const originalSize = originalFile?.size ?? 0;
  const compressedSize = compressedBlob?.size ?? 0;
  const ratio =
    originalSize > 0 && compressedSize > 0
      ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
      : null;

  const cardStyle: React.CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  };

  const inputStyle: React.CSSProperties = {
    background: colors.border,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '10px 12px',
    color: colors.text,
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    background: colors.accent,
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    color: colors.text,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '12px',
    fontFamily: 'monospace',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          <Minimize2 size={20} color={colors.accent} />
          <h1
            style={{
              color: colors.text,
              fontSize: '20px',
              fontWeight: 600,
              margin: 0,
            }}
          >
            Image Compressor
          </h1>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...cardStyle,
            border: dragOver
              ? `2px dashed ${colors.accent}`
              : `2px dashed ${colors.border}`,
            cursor: 'pointer',
            textAlign: 'center' as const,
            padding: originalPreview ? '12px' : '48px 24px',
            transition: 'border-color 0.2s',
            display: originalPreview ? 'flex' : 'block',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            style={{ display: 'none' }}
          />
          {originalPreview ? (
            <>
              <img
                src={originalPreview}
                alt="Original"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  flex: 1,
                  objectFit: 'contain',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.text, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                  {originalFile?.name}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>
                  {formatSize(originalSize)}
                </div>
              </div>
            </>
          ) : (
            <>
              <Upload size={32} color={colors.textSecondary} />
              <div style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '8px' }}>
                Drop an image here or click to select
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quality: {quality}%</label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: colors.accent,
                  marginTop: '8px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary, fontSize: '11px' }}>1</span>
                <span style={{ color: colors.textSecondary, fontSize: '11px' }}>100</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Output Format</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {(['jpeg', 'png'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    style={{
                      ...inputStyle,
                      width: 'auto',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      textAlign: 'center' as const,
                      background: outputFormat === fmt ? colors.accent : colors.border,
                      color: colors.text,
                      border: 'none',
                      fontWeight: outputFormat === fmt ? 600 : 400,
                    }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compress Button */}
        <button
          onClick={handleCompress}
          disabled={!originalFile || compressing}
          style={{
            ...buttonStyle,
            width: '100%',
            justifyContent: 'center',
            opacity: !originalFile || compressing ? 0.5 : 1,
            cursor: !originalFile || compressing ? 'not-allowed' : 'pointer',
          }}
        >
          <Minimize2 size={16} />
          {compressing ? 'Compressing...' : 'Compress'}
        </button>

        {/* Results */}
        {compressedPreview && (
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <Image size={16} color={colors.textSecondary} />
              <span style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
                Before / After
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                  Original
                </div>
                <img
                  src={originalPreview}
                  alt="Original"
                  style={{
                    width: '100%',
                    maxHeight: '220px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    background: colors.border,
                  }}
                />
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '6px', fontFamily: 'monospace' }}>
                  {formatSize(originalSize)}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <div style={{ color: colors.textSecondary, fontSize: '11px', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                  Compressed
                </div>
                <img
                  src={compressedPreview}
                  alt="Compressed"
                  style={{
                    width: '100%',
                    maxHeight: '220px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    background: colors.border,
                  }}
                />
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '6px', fontFamily: 'monospace' }}>
                  {formatSize(compressedSize)}
                </div>
              </div>
            </div>

            {ratio !== null && (
              <div
                style={{
                  textAlign: 'center' as const,
                  marginBottom: '16px',
                  padding: '12px',
                  background: colors.bg,
                  borderRadius: '8px',
                }}
              >
                <span
                  style={{
                    color: Number(ratio) > 0 ? '#22C55E' : '#EF4444',
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {Number(ratio) > 0 ? '-' : '+'}{ratio}%
                </span>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '4px' }}>
                  {Number(ratio) > 0
                    ? `Saved ${formatSize(originalSize - compressedSize)}`
                    : `Size increased by ${formatSize(compressedSize - originalSize)}`}
                </div>
              </div>
            )}

            <button
              onClick={handleDownload}
              style={{
                ...buttonStyle,
                background: '#22C55E',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <Download size={16} />
              Download Compressed Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
