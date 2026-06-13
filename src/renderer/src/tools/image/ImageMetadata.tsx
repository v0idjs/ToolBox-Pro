import { useState, useRef, useCallback } from 'react';
import { Upload, Info, Camera, FileImage } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

function getStyles(c: { bg: string; card: string; border: string; text: string; textSecondary: string; accent: string; input: string }) {
  return {
    container: {
      minHeight: '100%',
      color: c.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      color: c.text,
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: c.textSecondary,
      margin: 0,
    },
    card: {
      backgroundColor: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
    },
    dropZone: {
      border: `2px dashed ${c.border}`,
      borderRadius: '12px',
      padding: '48px 24px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'border-color 0.2s, background-color 0.2s',
      backgroundColor: c.input,
    },
    dropZoneActive: {
      borderColor: c.accent,
      backgroundColor: `${c.accent}1A`,
    },
    dropIcon: {
      color: c.accent,
      marginBottom: '16px',
    },
    dropText: {
      fontSize: '16px',
      color: c.text,
      marginBottom: '8px',
    },
    dropSubtext: {
      fontSize: '13px',
      color: c.textSecondary,
    },
    browseButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: c.accent,
      color: c.text,
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: '16px',
      transition: 'background-color 0.2s',
    },
    previewContainer: {
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap' as const,
      marginTop: '20px',
    },
    previewWrapper: {
      flex: '1 1 300px',
      minWidth: '280px',
    },
    previewImage: {
      width: '100%',
      maxHeight: '400px',
      objectFit: 'contain' as const,
      borderRadius: '8px',
      border: `1px solid ${c.border}`,
      backgroundColor: c.input,
    },
    metadataWrapper: {
      flex: '1 1 400px',
      minWidth: '320px',
    },
    metadataTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '14px',
    },
    metadataRow: {
      borderBottom: `1px solid ${c.border}`,
    },
    metadataLabel: {
      padding: '12px 16px',
      color: c.textSecondary,
      fontWeight: 500,
      whiteSpace: 'nowrap' as const,
      width: '160px',
      verticalAlign: 'top' as const,
    },
    metadataValue: {
      padding: '12px 16px',
      color: c.text,
      wordBreak: 'break-word' as const,
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 600,
      color: c.accent,
      marginBottom: '12px',
      marginTop: '20px',
    },
    noImage: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      color: c.textSecondary,
      fontSize: '14px',
      gap: '12px',
    },
  };
}

function parseExifData(buffer: ArrayBuffer): Record<string, string> {
  const dataView = new DataView(buffer);
  const exifData: Record<string, string> = {};

  if (dataView.getUint8(0) !== 0xFF || dataView.getUint8(1) !== 0xD8) {
    return exifData;
  }

  let offset = 2;
  while (offset < buffer.byteLength - 1) {
    if (dataView.getUint8(offset) !== 0xFF) {
      offset++;
      continue;
    }

    const marker = dataView.getUint8(offset + 1);

    if (marker === 0xE1) {
      const exifStart = offset + 4;
      const exifHeader = String.fromCharCode(
        dataView.getUint8(exifStart),
        dataView.getUint8(exifStart + 1),
        dataView.getUint8(exifStart + 2),
        dataView.getUint8(exifStart + 3),
        dataView.getUint8(exifStart + 4)
      );

      if (exifHeader !== 'Exif\0') {
        const segmentLength = dataView.getUint16(offset + 2, false);
        offset += 2 + segmentLength;
        continue;
      }

      const tiffStart = exifStart + 6;
      const byteOrder = dataView.getUint16(tiffStart, false);
      const littleEndian = byteOrder === 0x4949;

      const ifd0Offset = dataView.getUint32(tiffStart + 4, littleEndian);
      const ifd0Abs = tiffStart + ifd0Offset;

      const tagCount = dataView.getUint16(ifd0Abs, littleEndian);
      for (let i = 0; i < tagCount; i++) {
        const tagOffset = ifd0Abs + 2 + (i * 12);
        const tag = dataView.getUint16(tagOffset, littleEndian);
        const type = dataView.getUint16(tagOffset + 2, littleEndian);
        const count = dataView.getUint32(tagOffset + 4, littleEndian);
        const valueOffset = tagOffset + 8;

        const readAscii = (offset: number, len: number): string => {
          let str = '';
          for (let j = 0; j < len; j++) {
            const ch = dataView.getUint8(offset + j);
            if (ch === 0) break;
            str += String.fromCharCode(ch);
          }
          return str;
        };

        const readRational = (offset: number, len: number): string[] => {
          const rationals: string[] = [];
          for (let j = 0; j < len; j++) {
            const num = dataView.getUint32(offset + j * 8, littleEndian);
            const den = dataView.getUint32(offset + j * 8 + 4, littleEndian);
            rationals.push(`${num}/${den}`);
          }
          return rationals;
        };

        if (type === 2) {
          let valOffset = valueOffset;
          if (count > 4) {
            valOffset = tiffStart + dataView.getUint32(valueOffset, littleEndian);
          }
          const str = readAscii(valOffset, count);
          exifData[tag] = str;
        } else if (type === 3) {
          if (count === 1) {
            exifData[tag] = String(dataView.getUint16(valueOffset, littleEndian));
          } else {
            exifData[tag] = String(dataView.getUint16(valueOffset, littleEndian));
          }
        } else if (type === 5) {
          let valOffset = valueOffset;
          if (count > 1) {
            valOffset = tiffStart + dataView.getUint32(valueOffset, littleEndian);
          }
          const rationals = readRational(valOffset, count);
          if (count === 1) {
            exifData[tag] = rationals[0];
          } else {
            exifData[tag] = rationals.join(', ');
          }
        } else if (type === 4) {
          exifData[tag] = String(dataView.getUint32(valueOffset, littleEndian));
        }
      }

      const exifIfdPointer = dataView.getUint32(ifd0Abs + 2 + tagCount * 12, littleEndian);
      if (exifIfdPointer > 0) {
        const exifIfdAbs = tiffStart + exifIfdPointer;
        const exifTagCount = dataView.getUint16(exifIfdAbs, littleEndian);
        for (let i = 0; i < exifTagCount; i++) {
          const tagOffset = exifIfdAbs + 2 + (i * 12);
          const tag = dataView.getUint16(tagOffset, littleEndian);
          const type = dataView.getUint16(tagOffset + 2, littleEndian);
          const count = dataView.getUint32(tagOffset + 4, littleEndian);
          const valueOffset = tagOffset + 8;

          if (type === 3) {
            exifData[tag] = String(dataView.getUint16(valueOffset, littleEndian));
          } else if (type === 5) {
            let valOffset = valueOffset;
            if (count > 1) {
              valOffset = tiffStart + dataView.getUint32(valueOffset, littleEndian);
            }
            const num = dataView.getUint32(valOffset, littleEndian);
            const den = dataView.getUint32(valOffset + 4, littleEndian);
            exifData[tag] = `${num}/${den}`;
          } else if (type === 4) {
            exifData[tag] = String(dataView.getUint32(valueOffset, littleEndian));
          } else if (type === 2) {
            let valOffset = valueOffset;
            if (count > 4) {
              valOffset = tiffStart + dataView.getUint32(valueOffset, littleEndian);
            }
            let str = '';
            for (let j = 0; j < count; j++) {
              const ch = dataView.getUint8(valOffset + j);
              if (ch === 0) break;
              str += String.fromCharCode(ch);
            }
            exifData[tag] = str;
          }
        }
      }

      break;
    }

    const segmentLength = dataView.getUint16(offset + 2, false);
    offset += 2 + segmentLength;
  }

  const tagNames: Record<number, string> = {
    0x010F: 'Camera Make',
    0x0110: 'Camera Model',
    0x9003: 'Date Taken',
    0x829A: 'Exposure Time',
    0x829D: 'F-Number',
    0x920A: 'Focal Length',
    0x8827: 'ISO',
    0xA430: 'Camera Owner',
    0xA431: 'Body Serial Number',
    0xA432: 'Lens Info',
    0xA433: 'Lens Make',
    0xA434: 'Lens Model',
  };

  const result: Record<string, string> = {};
  for (const [tag, value] of Object.entries(exifData)) {
    const tagName = tagNames[Number(tag)] || `Tag 0x${Number(tag).toString(16).toUpperCase().padStart(4, '0')}`;
    result[tagName] = value;
  }

  return result;
}

export function ImageMetadata() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeColors = useThemeColors();
  const styles = getStyles(themeColors);

  const processFile = useCallback(async (file: File) => {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const basicMetadata: Record<string, string> = {
      'File Name': file.name,
      'File Size': file.size < 1024
        ? `${file.size} B`
        : file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      'MIME Type': file.type,
    };

    const buffer = await file.arrayBuffer();

    const img = new Image();
    img.src = previewUrl;
    await new Promise<void>((resolve) => {
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        resolve();
      };
      img.onerror = () => resolve();
    });

    if (file.type === 'image/jpeg') {
      const exif = parseExifData(buffer);
      Object.assign(basicMetadata, exif);

      if (exif['Exposure Time']) {
        const parts = exif['Exposure Time'].split('/');
        if (parts.length === 2) {
          const num = Number(parts[0]);
          const den = Number(parts[1]);
          if (num > 0 && den > 0) {
            if (den >= num) {
              basicMetadata['Exposure Time'] = `1/${Math.round(den / num)}s`;
            } else {
              basicMetadata['Exposure Time'] = `${(num / den).toFixed(1)}s`;
            }
          }
        }
      }

      if (exif['F-Number']) {
        const parts = exif['F-Number'].split('/');
        if (parts.length === 2) {
          const num = Number(parts[0]);
          const den = Number(parts[1]);
          if (den > 0) {
            basicMetadata['F-Number'] = `f/${(num / den).toFixed(1)}`;
          }
        }
      }

      if (exif['Focal Length']) {
        const parts = exif['Focal Length'].split('/');
        if (parts.length === 2) {
          const num = Number(parts[0]);
          const den = Number(parts[1]);
          if (den > 0) {
            basicMetadata['Focal Length'] = `${(num / den).toFixed(1)} mm`;
          }
        }
      }
    }

    setMetadata(basicMetadata);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FileImage size={28} color="#2563EB" />
        <div>
          <h1 style={styles.title}>Image Metadata</h1>
          <p style={styles.subtitle}>View image properties and EXIF data</p>
        </div>
      </div>

      <div style={styles.card}>
        <div
          style={{
            ...styles.dropZone,
            ...(isDragging ? styles.dropZoneActive : {}),
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
        >
          <Upload size={48} style={styles.dropIcon} />
          <p style={styles.dropText}>Drop an image here</p>
          <p style={styles.dropSubtext}>Supports JPEG, PNG, GIF, WebP, BMP</p>
          <button
            style={styles.browseButton}
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
          >
            <Upload size={16} />
            Browse Files
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {imagePreview && (
        <div style={styles.previewContainer}>
          <div style={styles.previewWrapper}>
            <img src={imagePreview} alt="Preview" style={styles.previewImage} />
          </div>

          <div style={styles.metadataWrapper}>
            {dimensions && (
              <>
                <div style={styles.sectionHeader}>
                  <Info size={16} />
                  Image Properties
                </div>
                <table style={styles.metadataTable}>
                  <tbody>
                    <tr style={styles.metadataRow}>
                      <td style={styles.metadataLabel}>Dimensions</td>
                      <td style={styles.metadataValue}>{dimensions.width} x {dimensions.height}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {Object.keys(metadata).length > 0 && (
              <>
                <div style={styles.sectionHeader}>
                  <Camera size={16} />
                  File & Metadata
                </div>
                <table style={styles.metadataTable}>
                  <tbody>
                    {Object.entries(metadata).map(([key, value]) => (
                      <tr key={key} style={styles.metadataRow}>
                        <td style={styles.metadataLabel}>{key}</td>
                        <td style={styles.metadataValue}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      {!imagePreview && (
        <div style={{ ...styles.card, ...styles.noImage }}>
          <FileImage size={48} color="#1E293B" />
          <p>No image selected</p>
        </div>
      )}
    </div>
  );
}
