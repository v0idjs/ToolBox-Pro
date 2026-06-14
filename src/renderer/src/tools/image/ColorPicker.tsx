import React, { useState, useRef, useCallback } from 'react';
import { Upload, Palette, Copy, Check, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

export function ColorPicker() {
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [pickedRgb, setPickedRgb] = useState<{ r: number; g: number; b: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const themeColors = useThemeColors();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleImageLoad = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(img, 0, 0);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(x, y, 1, 1).data;
    const r = data[0], g = data[1], b = data[2];
    const hex = rgbToHex(r, g, b);

    setPickedColor(hex);
    setPickedRgb({ r, g, b });
    setHistory((prev) => {
      const next = [hex, ...prev.filter((c) => c !== hex)].slice(0, 10);
      return next;
    });
  }, []);

  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }, []);

  const rgbToHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const colorValues = pickedRgb
    ? (() => {
        const { r, g, b } = pickedRgb;
        const hex = pickedColor!;
        const hsl = rgbToHsl(r, g, b);
        return [
          { label: 'HEX', value: hex },
          { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
          { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
        ];
      })()
    : [];

  return (
    <div style={{ color: themeColors.text, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Palette size={28} color={themeColors.accent} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Color Picker</h1>
            <p style={{ color: themeColors.textSecondary, fontSize: 15, margin: 0, marginTop: 4 }}>
              Pick colors from any image with precision
            </p>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!image ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              border: `2px dashed ${themeColors.border}`,
              borderRadius: 12,
              padding: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              background: themeColors.input,
              marginBottom: 32,
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFile(file);
              };
              input.click();
            }}
          >
            <Upload size={36} color={themeColors.textSecondary} />
            <span style={{ color: themeColors.textSecondary, fontSize: 15 }}>Drop an image here or click to browse</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                background: themeColors.input,
                border: `1px solid ${themeColors.border}`,
                borderRadius: 12,
                padding: 14,
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              <img
                ref={imgRef}
                src={image}
                alt="Uploaded"
                onLoad={handleImageLoad}
                onClick={handleClick}
                style={{
                  maxWidth: '100%',
                  maxHeight: 440,
                  display: 'block',
                  borderRadius: 10,
                  cursor: 'crosshair',
                }}
              />
            </div>

            {pickedColor && (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 12,
                    background: pickedColor,
                    border: `2px solid ${themeColors.border}`,
                    flexShrink: 0,
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 240 }}>
                  {colorValues.map((cv, i) => (
                    <button
                      key={cv.label}
                      onClick={() => copyToClipboard(cv.value, i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: themeColors.input,
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: themeColors.text,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ color: themeColors.textSecondary, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', marginRight: 14 }}>
                        {cv.label}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: 15, flex: 1, textAlign: 'left' }}>{cv.value}</span>
                      {copiedIndex === i ? (
                        <Check size={16} color="#22C55E" />
                      ) : (
                        <Copy size={16} color={themeColors.textSecondary} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div>
                <div style={{ fontSize: 15, color: themeColors.textSecondary, marginBottom: 10, fontWeight: 500 }}>History</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {history.map((color, i) => (
                    <button
                      key={color + i}
                      onClick={() => copyToClipboard(color, 100 + i)}
                      title={color}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: color,
                        border: `2px solid ${themeColors.border}`,
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setImage(null);
                setPickedColor(null);
                setPickedRgb(null);
                setHistory([]);
              }}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: `1px solid ${themeColors.border}`,
                borderRadius: 10,
                padding: '10px 20px',
                color: themeColors.textSecondary,
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: 'inherit',
              }}
            >
              Clear Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
