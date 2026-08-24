import { useState, useCallback } from 'react'
import { KeyRound, Copy, Check, Eye, EyeOff, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel } from '@/components/ui'

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

  const strength =
    password.length === 0
      ? null
      : password.length < 8
        ? { label: 'Weak', color: colors.error }
        : password.length < 12
          ? { label: 'Fair', color: colors.warning }
          : password.length < 16
            ? { label: 'Good', color: colors.success }
            : { label: 'Strong', color: colors.success }

  return (
    <div>
      <ToolHeader
        name="Password Generator"
        description="Generate cryptographically secure random passwords with customizable character options."
        category="security"
        icon={KeyRound}
        serial="password-generator"
      />

      <div className="tb-panel" style={{ padding: 20, marginBottom: 16 }}>
        <SectionLabel hint={`${length} characters`}>Length</SectionLabel>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="tb-panel" style={{ padding: 20, marginBottom: 20 }}>
        <SectionLabel>Character sets</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { label: 'Uppercase (A-Z)', value: uppercase, set: setUppercase },
            { label: 'Lowercase (a-z)', value: lowercase, set: setLowercase },
            { label: 'Numbers (0-9)', value: numbers, set: setNumbers },
            { label: 'Symbols (!@#)', value: symbols, set: setSymbols }
          ].map((opt) => (
            <label
              key={opt.label}
              className="tb-hoverable"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '11px 12px',
                background: opt.value ? colors.accentTint : colors.raised,
                borderRadius: 'var(--tb-radius-ctl)',
                border: `1px solid ${opt.value ? colors.accent : colors.border}`,
                cursor: 'pointer',
                fontSize: 13.5,
                color: colors.text,
                transition: 'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease'
              }}
            >
              <input
                type="checkbox"
                checked={opt.value}
                onChange={(e) => opt.set(e.target.checked)}
                style={{ width: 14, height: 14 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Button variant="primary" size="lg" icon={Zap} onClick={generate}>
        Generate
      </Button>

      {password && (
        <div style={{ marginTop: 28 }}>
          <SectionLabel
            hint={
              strength ? (
                <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              ) : undefined
            }
          >
            Generated password
          </SectionLabel>
          <div
            className="tb-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '13px 14px',
              background: colors.bgDeep,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--tb-radius-ctl)',
              fontSize: 14.5,
              wordBreak: 'break-all',
              color: colors.text,
              lineHeight: 1.6
            }}
          >
            <span style={{ flex: 1 }}>{showPassword ? password : '•'.repeat(password.length)}</span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide' : 'Reveal'}
              style={{
                display: 'flex',
                padding: 5,
                background: 'transparent',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                color: colors.textSecondary,
                flexShrink: 0
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              onClick={copyPassword}
              aria-label="Copy password"
              title="Copy"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 9px',
                background: 'transparent',
                color: copied ? colors.success : colors.textSecondary,
                border: `1px solid ${copied ? colors.success : colors.borderStrong}`,
                borderRadius: 'var(--tb-radius-ctl)',
                fontSize: 12,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p
            style={{
              marginTop: 8,
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: colors.textFaint
            }}
          >
            {password.length} chars · {new Set(password).size} unique ·{' '}
            {strength ? strength.label : '—'}
          </p>
        </div>
      )}
    </div>
  )
}
