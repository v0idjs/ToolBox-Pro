import type { ReactNode } from 'react'

interface StatStripProps {
  items: { value: string; label: string }[]
}

/** Inline instrument readout — hairline-separated, mono values. Not a card trio. */
export function StatStrip({ items }: StatStripProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 20,
        rowGap: 8
      }}
    >
      {items.map((item, i) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          {i > 0 && (
            <span aria-hidden style={{ width: 1, height: 14, backgroundColor: 'var(--tb-border)' }} />
          )}
          <span
            style={{
              fontFamily: 'var(--tb-font-display)',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: 'var(--tb-text)'
            }}
          >
            {item.value}
          </span>
          <span
            style={{
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--tb-text-faint)'
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

interface RowProps {
    children: ReactNode
    onClick?: () => void
    style?: React.CSSProperties
}

/** Hairline-divided row used inside panels (category lists, result strips). */
export function PanelRow({ children, onClick, style }: RowProps) {
  const clickable = typeof onClick === 'function'
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 4px',
        cursor: clickable ? 'pointer' : undefined,
        borderRadius: 'var(--tb-radius-ctl)',
        ...style
      }}
    >
      {children}
    </div>
  )
}
