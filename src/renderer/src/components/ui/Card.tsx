import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <div className="tb-panel" style={{ padding: 20, ...style }} {...rest}>
      {children}
    </div>
  )
}

interface SectionLabelProps {
  children: ReactNode
  hint?: ReactNode
}

/** Mono eyebrow that labels a section — signage, not decoration. */
export function SectionLabel({ children, hint }: SectionLabelProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12
      }}
    >
      <span
        style={{
          fontFamily: 'var(--tb-font-mono)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--tb-text-faint)'
        }}
      >
        {children}
      </span>
      {hint && (
        <span
          style={{
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            color: 'var(--tb-text-faint)'
          }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}
