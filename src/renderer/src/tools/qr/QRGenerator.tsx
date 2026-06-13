import React, { useState, useRef, useCallback, useEffect } from 'react'
import { QrCode, Download, Wifi, Type } from 'lucide-react'
import QRCode from 'qrcode'
import { useThemeColors } from '@/lib/theme'

export function QRGenerator() {
  const colors = useThemeColors()
  const [input, setInput] = useState('')
  const [qrType, setQrType] = useState<'text' | 'url' | 'wifi'>('text')
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [size, setSize] = useState(400)
  const [fgColor, setFgColor] = useState(colors.text)
  const [bgColor, setBgColor] = useState(colors.input)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setFgColor(colors.text)
    setBgColor(colors.input)
  }, [colors.text, colors.input])

  const generateQR = useCallback(async () => {
    let content = ''
    if (qrType === 'wifi') {
      const escapeWifi = (s: string) =>
        s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/;/g, '\\;').replace(/,/g, '\\,')
      content = `WIFI:T:WPA;S:${escapeWifi(ssid)};P:${escapeWifi(password)};;`
    } else {
      content = input
    }

    if (!content) return
    if (!canvasRef.current) return

    try {
      setError('')
      await QRCode.toCanvas(canvasRef.current, content, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      })
      setGenerated(true)
    } catch (e) {
      console.error('QR generation failed:', e)
      setError('Failed to generate QR code. Content may be too long.')
    }
  }, [qrType, input, ssid, password, size, fgColor, bgColor])

  const downloadPNG = () => {
    if (!canvasRef.current || !generated) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '520px',
    },
    title: {
      color: colors.text,
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: '14px',
      marginBottom: '24px',
    },
    typeSelector: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
    },
    typeBtn: (active: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${active ? colors.accent : colors.border}`,
      backgroundColor: active ? colors.accent + '20' : 'transparent',
      color: active ? colors.text : colors.textSecondary,
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.15s',
    }),
    label: {
      color: colors.textSecondary,
      fontSize: '13px',
      fontWeight: '500',
      marginBottom: '6px',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.input,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      marginBottom: '16px',
      boxSizing: 'border-box' as const,
    },
    row: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
    },
    colorGroup: {
      flex: 1,
    },
    colorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    colorInput: {
      width: '36px',
      height: '36px',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      padding: 0,
    },
    colorHex: {
      color: colors.text,
      fontSize: '13px',
      fontFamily: 'monospace',
    },
    sliderContainer: {
      marginBottom: '20px',
    },
    sliderRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px',
    },
    sliderValue: {
      color: colors.text,
      fontSize: '13px',
      fontFamily: 'monospace',
    },
    slider: {
      width: '100%',
      accentColor: colors.accent,
      height: '4px',
    },
    btnPrimary: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: colors.accent,
      color: colors.text,
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '12px',
      transition: 'opacity 0.15s',
    },
    btnDownload: {
      width: '100%',
      padding: '10px',
      borderRadius: '10px',
      border: `1px solid ${colors.border}`,
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.15s',
    },
    canvasContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      padding: '20px',
      backgroundColor: colors.input,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      minHeight: generated ? 'auto' : '60px',
    },
    placeholder: {
      color: colors.textSecondary,
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    error: {
      color: '#EF4444',
      fontSize: '13px',
      marginBottom: '12px',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>
          <QrCode size={24} color={colors.accent} />
          QR Code Generator
        </div>
        <div style={styles.subtitle}>Generate QR codes for text, URLs, or WiFi networks</div>

        <div style={styles.typeSelector}>
          <button style={styles.typeBtn(qrType === 'text')} onClick={() => setQrType('text')}>
            <Type size={14} />
            Text
          </button>
          <button style={styles.typeBtn(qrType === 'url')} onClick={() => setQrType('url')}>
            <QrCode size={14} />
            URL
          </button>
          <button style={styles.typeBtn(qrType === 'wifi')} onClick={() => setQrType('wifi')}>
            <Wifi size={14} />
            WiFi
          </button>
        </div>

        {qrType === 'wifi' ? (
          <>
            <label style={styles.label}>SSID (Network Name)</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter network name"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
            />
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        ) : (
          <>
            <label style={styles.label}>{qrType === 'url' ? 'URL' : 'Text Content'}</label>
            <input
              style={styles.input}
              type="text"
              placeholder={qrType === 'url' ? 'https://example.com' : 'Enter text...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </>
        )}

        <div style={styles.sliderContainer}>
          <div style={styles.sliderRow}>
            <span style={styles.label}>Size</span>
            <span style={styles.sliderValue}>{size}px</span>
          </div>
          <input
            type="range"
            min={200}
            max={600}
            step={10}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.colorGroup}>
            <label style={styles.label}>Foreground</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                style={styles.colorInput}
              />
              <span style={styles.colorHex}>{fgColor}</span>
            </div>
          </div>
          <div style={styles.colorGroup}>
            <label style={styles.label}>Background</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={styles.colorInput}
              />
              <span style={styles.colorHex}>{bgColor}</span>
            </div>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btnPrimary} onClick={generateQR}>
          <QrCode size={18} />
          Generate QR Code
        </button>

        <button
          style={{
            ...styles.btnDownload,
            opacity: generated ? 1 : 0.4,
            pointerEvents: generated ? 'auto' : 'none',
          }}
          onClick={downloadPNG}
        >
          <Download size={16} />
          Download as PNG
        </button>

        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            style={{ borderRadius: '8px', display: generated ? 'block' : 'none' }}
          />
          {!generated && (
            <div style={styles.placeholder}>
              <QrCode size={16} />
              QR code will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
