import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { getCategory } from '@/lib/categories'

interface ToolHeaderProps {
  name: string
  description: string
  category?: string
  icon?: LucideIcon
  /** Stable identifier rendered as the instrument's serial plate. */
  serial?: string
  /** Right-aligned action slot (e.g. copy-all, export). */
  actions?: ReactNode
}

export function ToolHeader({ name, description, category, icon: Icon, serial, actions }: ToolHeaderProps) {
  const meta = category ? getCategory(category) : undefined

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        paddingBottom: 18,
        marginBottom: 24,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        {Icon && (
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--tb-radius-panel)',
              border: '1px solid var(--tb-border-strong)',
              backgroundColor: 'var(--tb-accent-tint)',
              color: 'var(--tb-accent)'
            }}
          >
            <Icon size={19} strokeWidth={1.8} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          {(meta || serial) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 3,
                fontFamily: 'var(--tb-font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--tb-text-faint)'
              }}
            >
              {meta && (
                <span
                  style={{
                    padding: '2px 5px',
                    borderRadius: 3,
                    border: `1px solid ${'var(--tb-border-strong)'}`,
                    fontWeight: 600,
                    color: 'var(--tb-text-secondary)'
                  }}
                >
                  {meta.tag}
                </span>
              )}
              {serial && <span>{serial}</span>}
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--tb-font-display)',
              fontSize: 26,
              lineHeight: 1.05,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              color: 'var(--tb-text)'
            }}
          >
            {name}
          </h1>
          <p
            style={{
              marginTop: 4,
              fontSize: 13.5,
              color: 'var(--tb-text-secondary)'
            }}
          >
            {description}
          </p>
        </div>
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: 1,
          backgroundColor: 'var(--tb-border)'
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          bottom: -1,
          width: 44,
          height: 3,
          backgroundColor: 'var(--tb-accent)'
        }}
      />
    </header>
  )
}
