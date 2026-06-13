import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Maximize2, Link, Unlink } from "lucide-react";
import { useThemeColors } from '@/lib/theme';

const PRESETS = [25, 50, 75, 150, 200] as const;

export function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string>("");
  const themeColors = useThemeColors();
  const colors = {
    bg: themeColors.bg,
    card: themeColors.card,
    border: themeColors.border,
    text: themeColors.text,
    muted: themeColors.textSecondary,
    primary: themeColors.accent,
    primaryHover: themeColors.accentHover,
    inputBg: themeColors.input,
  };

  const aspectRatio = originalWidth / originalHeight;

  const loadImage = useCallback((file: File) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setFileName(file.name);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setResizedBlob(null);
      setEstimatedSize("");
    };
    img.src = url;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      loadImage(file);
    },
    [loadImage]
  );

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

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setWidth(newWidth);
      if (aspectLocked && aspectRatio > 0) {
        setHeight(Math.round(newWidth / aspectRatio));
      }
    },
    [aspectLocked, aspectRatio]
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      setHeight(newHeight);
      if (aspectLocked && aspectRatio > 0) {
        setWidth(Math.round(newHeight * aspectRatio));
      }
    },
    [aspectLocked, aspectRatio]
  );

  const applyPreset = useCallback(
    (percent: number) => {
      if (!image) return;
      const w = Math.round(originalWidth * (percent / 100));
      const h = Math.round(originalHeight * (percent / 100));
      setWidth(w);
      setHeight(h);
    },
    [image, originalWidth, originalHeight]
  );

  const resizeImage = useCallback(() => {
    if (!image || width <= 0 || height <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        setResizedBlob(blob);
        if (blob) {
          const kb = (blob.size / 1024).toFixed(1);
          const mb = (blob.size / (1024 * 1024)).toFixed(2);
          setEstimatedSize(blob.size > 1024 * 1024 ? `${mb} MB` : `${kb} KB`);
        }
      },
      "image/png",
      1
    );
  }, [image, width, height]);

  const handleDownload = useCallback(() => {
    if (!resizedBlob) return;
    const url = URL.createObjectURL(resizedBlob);
    const a = document.createElement("a");
    a.href = url;
    const ext = fileName.split(".").pop() || "png";
    const base = fileName.replace(/\.[^.]+$/, "");
    a.download = `${base}_${width}x${height}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resizedBlob, fileName, width, height]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: colors.text,
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Maximize2 size={24} color={colors.primary} />
          Image Resizer
        </h1>
        <p style={{ color: colors.muted, marginBottom: 24 }}>
          Resize images using the Canvas API with aspect ratio lock.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? colors.primary : colors.border}`,
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#1a2744" : colors.card,
            transition: "border-color 0.2s, background 0.2s",
            marginBottom: 24,
          }}
        >
          <Upload
            size={40}
            color={colors.muted}
            style={{ marginBottom: 12 }}
          />
          <p style={{ fontSize: 14, color: colors.muted, margin: 0 }}>
            Drag & drop an image here or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {/* Preview & info */}
        {image && (
          <div
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 200px", minHeight: 120 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: 260,
                    objectFit: "contain",
                    borderRadius: 8,
                    background: "#000",
                  }}
                />
              </div>
              <div
                style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 8 }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {fileName}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      background: colors.inputBg,
                      borderRadius: 8,
                      padding: "8px 12px",
                    }}
                  >
                    <span style={{ fontSize: 11, color: colors.muted }}>
                      Original
                    </span>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      {originalWidth} &times; {originalHeight}
                    </div>
                  </div>
                  {resizedBlob && (
                    <div
                      style={{
                        flex: 1,
                        background: colors.inputBg,
                        borderRadius: 8,
                        padding: "8px 12px",
                      }}
                    >
                      <span style={{ fontSize: 11, color: colors.muted }}>
                        New
                      </span>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: colors.primary,
                        }}
                      >
                        {width} &times; {height}
                      </div>
                    </div>
                  )}
                </div>
                {estimatedSize && (
                  <div
                    style={{
                      background: colors.inputBg,
                      borderRadius: 8,
                      padding: "8px 12px",
                    }}
                  >
                    <span style={{ fontSize: 11, color: colors.muted }}>
                      Estimated size
                    </span>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#34D399",
                      }}
                    >
                      {estimatedSize}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dimension inputs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 160px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: colors.muted,
                    marginBottom: 4,
                  }}
                >
                  Width (px)
                </label>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    color: colors.text,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                onClick={() => setAspectLocked(!aspectLocked)}
                title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                style={{
                  marginTop: 18,
                  background: aspectLocked ? colors.primary : colors.inputBg,
                  border: `1px solid ${aspectLocked ? colors.primary : colors.border}`,
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
              >
                {aspectLocked ? (
                  <Link size={16} color={colors.text} />
                ) : (
                  <Unlink size={16} color={colors.muted} />
                )}
              </button>

              <div style={{ flex: "1 1 160px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: colors.muted,
                    marginBottom: 4,
                  }}
                >
                  Height (px)
                </label>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    color: colors.text,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginRight: 8,
                }}
              >
                Presets:
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  style={{
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 6,
                    padding: "6px 12px",
                    color: colors.text,
                    fontSize: 12,
                    cursor: "pointer",
                    marginRight: 6,
                    marginBottom: 6,
                  }}
                >
                  {p}%
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={resizeImage}
                style={{
                  flex: "1 1 160px",
                  padding: "12px 20px",
                  background: colors.primary,
                  color: colors.text,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Maximize2 size={16} />
                Resize
              </button>

              {resizedBlob && (
                <button
                  onClick={handleDownload}
                  style={{
                    flex: "1 1 160px",
                    padding: "12px 20px",
                    background: "#059669",
                    color: colors.text,
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
