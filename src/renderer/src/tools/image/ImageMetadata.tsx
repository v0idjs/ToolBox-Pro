import { useState, useRef, useCallback } from 'react'
import { Upload, FileImage } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

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
  const colors = useThemeColors();

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

  const keyCellStyle = {
    padding: '11px 4px',
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 10.5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: colors.textFaint,
    whiteSpace: 'nowrap' as const,
    width: 170,
    verticalAlign: 'top' as const
  };

  const valueCellStyle = {
    padding: '11px 4px',
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 12.5,
    color: colors.text,
    wordBreak: 'break-word' as const
  };

  return (
    <div>
      <ToolHeader
        name="Image Metadata Viewer"
        description="View image properties and EXIF data."
        category="image"
        icon={FileImage}
        serial="image-metadata"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {imagePreview ? (
        <div className="tb-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', minWidth: 280 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 'var(--tb-radius-ctl)',
                  border: `1px solid ${colors.border}`,
                  background: colors.bgDeep,
                  display: 'block'
                }}
              />
            </div>

            <div style={{ flex: '1 1 360px', minWidth: 300 }}>
              {dimensions && (
                <>
                  <SectionLabel>Image properties</SectionLabel>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={keyCellStyle}>Dimensions</td>
                        <td style={valueCellStyle}>
                          {dimensions.width} × {dimensions.height}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}

              {Object.keys(metadata).length > 0 && (
                <>
                  <SectionLabel>File &amp; metadata</SectionLabel>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(metadata).map(([key, value]) => (
                        <tr key={key} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={keyCellStyle}>{key}</td>
                          <td style={valueCellStyle}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          style={{
            border: `1px dashed ${isDragging ? colors.accent : colors.borderStrong}`,
            borderRadius: 'var(--tb-radius-panel)',
            background: isDragging ? colors.accentTint : colors.raised,
            padding: '56px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition:
              'border-color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease'
          }}
        >
          <Upload size={44} color={colors.textSecondary} style={{ marginBottom: 14 }} />
          <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
            Drop an image here
          </p>
          <p
            style={{
              fontSize: 11,
              fontFamily: 'var(--tb-font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.textFaint,
              marginTop: 12
            }}
          >
            JPEG · PNG · GIF · WEBP · BMP
          </p>
          <Button
            variant="secondary"
            icon={Upload}
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            style={{ marginTop: 16 }}
          >
            Browse Files
          </Button>
        </div>
      )}

      {!imagePreview && (
        <div
          className="tb-panel"
          style={{
            padding: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textSecondary,
            fontSize: 14,
            gap: 14,
            marginTop: 16
          }}
        >
          <FileImage size={44} color={colors.borderStrong} />
          <p style={{ margin: 0 }}>No image selected</p>
        </div>
      )}
    </div>
  );
}
