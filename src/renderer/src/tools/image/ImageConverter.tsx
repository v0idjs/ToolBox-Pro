import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image, RefreshCw, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp';

const FORMAT_OPTIONS: { label: string; value: OutputFormat; mime: string }[] = [
  { label: 'PNG', value: 'image/png', mime: 'png' },
  { label: 'JPEG', value: 'image/jpeg', mime: 'jpg' },
  { label: 'WEBP', value: 'image/webp', mime: 'webp' },
  { label: 'BMP', value: 'image/bmp', mime: 'bmp' },
];

export function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [quality, setQuality] = useState(92);
  const [isDragging, setIsDragging] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setOriginalSize(file.size);
    setConvertedSize(null);
    setConvertedBlob(null);
    setConvertedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const convertImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    ctx.drawImage(originalImage, 0, 0);

    const qualityValue = (outputFormat === 'image/png' || outputFormat === 'image/bmp')
      ? undefined
      : quality / 100;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setConvertedBlob(blob);
          setConvertedSize(blob.size);
          setConvertedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      },
      outputFormat,
      qualityValue
    );
  }, [originalImage, outputFormat, quality]);

  const handleDownload = () => {
    if (!convertedBlob) return;
    const ext = FORMAT_OPTIONS.find((f) => f.value === outputFormat)?.mime ?? 'png';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(convertedBlob);
    link.download = `converted.${ext}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalSize(0);
    setConvertedSize(null);
    setConvertedBlob(null);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setConvertedUrl(null);
    setOutputFormat('image/png');
    setQuality(92);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showQuality = outputFormat === 'image/jpeg' || outputFormat === 'image/webp';

  return (
    <div style={{ minHeight: '100%', color: colors.text, fontFamily: 'system-ui, sans-serif' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Image size={28} color={colors.accent} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Image Converter</h1>
            <p style={{ color: colors.textSecondary, fontSize: 15, margin: 0, marginTop: 4 }}>
              Convert images between different formats with ease
            </p>
          </div>
        </div>

        {!originalImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? colors.accent : colors.border}`,
              borderRadius: 12,
              background: colors.input,
              padding: '64px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              marginBottom: 32,
            }}
          >
            <Upload size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: colors.textSecondary, margin: 0 }}>
              Drag and drop an image here, or click to browse
            </p>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10 }}>
              Supports PNG, JPEG, WEBP, BMP, GIF, and more
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', background: colors.input, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 20 }}>
                <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Original</p>
                <img
                  src={originalImage.src}
                  alt="Original"
                  style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 300, objectFit: 'contain' }}
                />
                <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10 }}>
                  {originalImage.naturalWidth} × {originalImage.naturalHeight} · {formatSize(originalSize)}
                </p>
              </div>
              {convertedUrl && (
              <div style={{ flex: '1 1 300px', background: colors.input, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 20 }}>
                  <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Converted</p>
                  <img
                    src={convertedUrl}
                    alt="Converted"
                    style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 300, objectFit: 'contain' }}
                  />
                  <p style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10 }}>
                    {originalImage.naturalWidth} × {originalImage.naturalHeight} · {convertedSize !== null ? formatSize(convertedSize) : '—'}
                  </p>
                </div>
              )}
            </div>

            <div style={{ background: colors.input, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 15, color: colors.textSecondary, fontWeight: 500, display: 'block', marginBottom: 10 }}>
                  Output Format
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {FORMAT_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setOutputFormat(f.value)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 10,
                        border: `1px solid ${outputFormat === f.value ? colors.accent : colors.border}`,
                        background: outputFormat === f.value ? colors.accent : 'transparent',
                        color: colors.text,
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {showQuality && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 15, color: colors.textSecondary, fontWeight: 500 }}>
                      Quality
                    </label>
                    <span style={{ fontSize: 15, color: colors.text, fontWeight: 600 }}>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: colors.accent,
                      height: 6,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>
                    <span>Smaller</span>
                    <span>Better quality</span>
                  </div>
                </div>
              )}

              {convertedSize !== null && originalSize > 0 && (
                <div style={{ background: colors.bg, borderRadius: 10, padding: 14, fontSize: 14 }}>
                  <span style={{ color: colors.textSecondary }}>Original: </span>
                  <span style={{ color: colors.text, fontWeight: 600 }}>{formatSize(originalSize)}</span>
                  <span style={{ color: colors.textSecondary, margin: '0 14px' }}>→</span>
                  <span style={{ color: colors.textSecondary }}>Converted: </span>
                  <span style={{ color: colors.text, fontWeight: 600 }}>{formatSize(convertedSize)}</span>
                  <span style={{ color: colors.textSecondary, marginLeft: 14 }}>(
                    {convertedSize < originalSize
                      ? `−${(((originalSize - convertedSize) / originalSize) * 100).toFixed(1)}%`
                      : `+${(((convertedSize - originalSize) / originalSize) * 100).toFixed(1)}%`}
                  )</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button
                  onClick={convertImage}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 10,
                    border: 'none',
                    background: colors.accent,
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: '1 1 auto',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={18} />
                  Convert
                </button>

                {convertedBlob && (
                  <button
                    onClick={handleDownload}
                    style={{
                      padding: '14px 28px',
                      borderRadius: 10,
                      border: `1px solid ${colors.border}`,
                      background: 'transparent',
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flex: '1 1 auto',
                      justifyContent: 'center',
                    }}
                  >
                    <Download size={18} />
                    Download
                  </button>
                )}

                <button
                  onClick={handleReset}
                  style={{
                    padding: '14px 24px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: 'transparent',
                    color: colors.textSecondary,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
