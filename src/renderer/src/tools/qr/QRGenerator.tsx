import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react'
import { QrCode, Download, Wifi, Type, Zap } from 'lucide-react'
import QRCode from 'qrcode'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Input, SectionLabel } from '@/components/ui'

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

  const typeBtnStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 'var(--tb-radius-ctl)',
    border: `1px solid ${active ? colors.accent : colors.borderStrong}`,
    backgroundColor: active ? colors.accentTint : colors.raised,
    color: active ? colors.accent : colors.textSecondary,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    transition:
      'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease, color var(--tb-speed-fast) ease',
    fontFamily: 'inherit'
  })

  const colorInputStyle: CSSProperties = {
    width: 40,
    height: 40,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: 'var(--tb-radius-ctl)',
    cursor: 'pointer',
    backgroundColor: colors.raised,
    padding: 0
  }

  return (
    <div>
      <ToolHeader
        name="QR Generator"
        description="Generate QR codes for text, URLs, and WiFi credentials."
        category="qr"
        icon={QrCode}
        serial="qr-generator"
      />

      <div className="tb-panel" style={{ padding: 20, marginBottom: 16 }}>
        <SectionLabel>Content type</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <button style={typeBtnStyle(qrType === 'text')} onClick={() => setQrType('text')}>
            <Type size={15} />
            Text
          </button>
          <button style={typeBtnStyle(qrType === 'url')} onClick={() => setQrType('url')}>
            <QrCode size={15} />
            URL
          </button>
          <button style={typeBtnStyle(qrType === 'wifi')} onClick={() => setQrType('wifi')}>
            <Wifi size={15} />
            WiFi
          </button>
        </div>

        {qrType === 'wifi' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              label="SSID (Network Name)"
              type="text"
              placeholder="Enter network name"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        ) : (
          <Input
            label={qrType === 'url' ? 'URL' : 'Text Content'}
            type="text"
            placeholder={qrType === 'url' ? 'https://example.com' : 'Enter text...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}
      </div>

      <div className="tb-panel" style={{ padding: 20, marginBottom: 16 }}>
        <SectionLabel hint={`${size}px`}>Size</SectionLabel>
        <input
          type="range"
          min={200}
          max={600}
          step={10}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={{ width: '100%' }}
        />

        <div style={{ height: 16 }} />

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--tb-font-mono)',
                fontSize: 10.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.textFaint,
                marginBottom: 8
              }}
            >
              Foreground
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                style={colorInputStyle}
              />
              <span className="tb-mono" style={{ fontSize: 12.5, color: colors.text }}>
                {fgColor}
              </span>
            </div>
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--tb-font-mono)',
                fontSize: 10.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.textFaint,
                marginBottom: 8
              }}
            >
              Background
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={colorInputStyle}
              />
              <span className="tb-mono" style={{ fontSize: 12.5, color: colors.text }}>
                {bgColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p
          className="tb-mono"
          role="alert"
          style={{ color: colors.error, fontSize: 12.5, margin: '0 0 12px' }}
        >
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <Button variant="primary" size="lg" icon={Zap} onClick={generateQR} style={{ width: '100%' }}>
          Generate QR Code
        </Button>
        <Button
          variant="secondary"
          icon={Download}
          disabled={!generated}
          onClick={downloadPNG}
          style={{ width: '100%' }}
        >
          Download as PNG
        </Button>
      </div>

      <div
        className="tb-panel"
        style={{
          padding: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: generated ? undefined : 96
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ borderRadius: 'var(--tb-radius-ctl)', display: generated ? 'block' : 'none' }}
        />
        {!generated && (
          <div
            style={{
              color: colors.textFaint,
              fontSize: 13,
              fontFamily: 'var(--tb-font-mono)',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <QrCode size={16} />
            QR code will appear here
          </div>
        )}
      </div>
    </div>
  )
}
