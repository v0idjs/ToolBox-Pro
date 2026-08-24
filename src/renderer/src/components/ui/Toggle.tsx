import { useThemeColors } from '@/lib/theme'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

/** Machined switch — square slider on a rail, not a soft pill. */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  const colors = useThemeColors()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 20,
        flexShrink: 0,
        position: 'relative',
        borderRadius: 'var(--tb-radius-ctl)',
        border: `1px solid ${checked ? colors.accent : colors.borderStrong}`,
        backgroundColor: checked ? colors.accentTint : colors.raised,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 19 : 2,
          width: 13,
          height: 13,
          borderRadius: 3,
          backgroundColor: checked ? colors.accent : colors.textFaint,
          boxShadow: checked ? `0 0 8px ${colors.accentTint}` : 'none',
          transition: 'left var(--tb-speed) ease, background-color var(--tb-speed-fast) ease'
        }}
      />
    </button>
  )
}
