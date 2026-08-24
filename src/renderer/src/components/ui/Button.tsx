import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  isLoading?: boolean
  children?: ReactNode
}

const sizes: Record<Size, { padding: string; fontSize: number }> = {
  sm: { padding: '5px 10px', fontSize: 12.5 },
  md: { padding: '8px 14px', fontSize: 13.5 },
  lg: { padding: '11px 20px', fontSize: 15 }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    isLoading = false,
    disabled,
    style,
    children,
    ...rest
  },
  ref
) {
  const colors = useThemeColors()
  const sizeStyle = sizes[size]

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.accent,
      color: colors.onAccent,
      border: '1px solid transparent',
      fontWeight: 600
    },
    secondary: {
      backgroundColor: colors.raised,
      color: colors.text,
      border: `1px solid ${colors.borderStrong}`,
      fontWeight: 500
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      border: '1px solid transparent',
      fontWeight: 500
    },
    danger: {
      backgroundColor: colors.error,
      color: '#FFFFFF',
      border: '1px solid transparent',
      fontWeight: 600
    }
  }

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        borderRadius: 'var(--tb-radius-ctl)',
        fontFamily: 'var(--tb-font-ui)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        transition:
          'background-color var(--tb-speed-fast) ease, border-color var(--tb-speed-fast) ease, color var(--tb-speed-fast) ease',
        ...sizeStyle,
        ...variantStyles[variant],
        ...(disabled || isLoading ? { opacity: 0.55, cursor: 'not-allowed' } : {}),
        ...style
      }}
      {...rest}
    >
      {isLoading ? (
        <span
          aria-hidden
          style={{
            width: 13,
            height: 13,
            flexShrink: 0,
            borderRadius: '50%',
            border: `2px solid currentColor`,
            borderTopColor: 'transparent',
            animation: 'tb-spin 0.7s linear infinite'
          }}
        />
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2} />
      )}
      {children}
    </button>
  )
})
