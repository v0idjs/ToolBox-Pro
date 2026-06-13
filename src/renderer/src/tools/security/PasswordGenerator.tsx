import { useState, useCallback } from 'react'
import { Shield, Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

export function PasswordGenerator() {
  const colors = useThemeColors()
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(true)

  const generate = useCallback(() => {
    let chars = ''
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (numbers) chars += '0123456789'
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    if (!chars) {
      setPassword('Select at least one character type')
      return
    }
    let result = ''
    const arr = new Uint32Array(length)
    crypto.getRandomValues(arr)
    for (let i = 0; i < length; i++) {
      result += chars[arr[i] % chars.length]
    }
    setPassword(result)
    setCopied(false)
  }, [length, uppercase, lowercase, numbers, symbols])

  const copyPassword = async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const strength = password.length === 0 ? null :
    password.length < 8 ? { label: 'Weak', color: '#EF4444' } :
    password.length < 12 ? { label: 'Fair', color: '#F59E0B' } :
    password.length < 16 ? { label: 'Good', color: '#22C55E' } :
    { label: 'Strong', color: '#22C55E' }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={24} color={colors.accent} />
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Password Generator</h1>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
          Length: {length}
        </label>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{ width: '100%', accentColor: colors.accent }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Uppercase (A-Z)', value: uppercase, set: setUppercase },
          { label: 'Lowercase (a-z)', value: lowercase, set: setLowercase },
          { label: 'Numbers (0-9)', value: numbers, set: setNumbers },
          { label: 'Symbols (!@#)', value: symbols, set: setSymbols }
        ].map((opt) => (
          <label
            key={opt.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: colors.bg,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              cursor: 'pointer',
              fontSize: 14,
              color: colors.text
            }}
          >
            <input
              type="checkbox"
              checked={opt.value}
              onChange={(e) => opt.set(e.target.checked)}
              style={{ accentColor: colors.accent }}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={generate}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <RefreshCw size={16} />
          Generate
        </button>
        {password && (
          <button
            onClick={copyPassword}
            style={{
              padding: '12px 24px',
              background: copied ? '#22C55E' : colors.bg,
              color: copied ? '#fff' : colors.text,
              border: `1px solid ${copied ? '#22C55E' : colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {password && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>Generated Password</span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div
            style={{
              padding: 16,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 16,
              wordBreak: 'break-all',
              color: colors.text,
              lineHeight: 1.6
            }}
          >
            {showPassword ? password : '•'.repeat(password.length)}
          </div>
          {strength && (
            <div style={{ marginTop: 8, fontSize: 13, color: strength.color }}>
              Strength: {strength.label}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
