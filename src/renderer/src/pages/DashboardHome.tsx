import { ArrowUpRight, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { getAllTools, getToolsByCategory, getTool } from '@/lib/tool-registry'
import { CATEGORIES, getCategory } from '@/lib/categories'
import { StatStrip } from '@/components/ui'

function ToolCard({
  icon: Icon,
  title,
  description,
  onClick,
  pinned
}: {
  icon: LucideIcon
  title: string
  description: string
  onClick: () => void
  pinned?: boolean
}) {
  return (
    <button className="tb-panel tb-hoverable" onClick={onClick} style={{ padding: '16px 16px 14px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 14
        }}
      >
        <span
          aria-hidden
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--tb-radius-panel)',
            backgroundColor: 'var(--tb-accent-tint)',
            color: 'var(--tb-accent)'
          }}
        >
          <Icon size={17} strokeWidth={1.9} />
        </span>
        {pinned && (
          <Star size={12} aria-label="Pinned" fill="var(--tb-accent)" color="var(--tb-accent)" />
        )}
      </div>
      <h3
        style={{
          fontFamily: 'var(--tb-font-display)',
          fontSize: 15.5,
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: 'var(--tb-text)'
        }}
      >
        {title}
      </h3>
      <p style={{ marginTop: 2, fontSize: 12.5, lineHeight: 1.45, color: 'var(--tb-text-secondary)' }}>
        {description}
      </p>
    </button>
  )
}

export function DashboardHome() {
  const { setActiveTool, favorites, recentTools } = useAppStore()

  const allTools = getAllTools()
  const totalTools = allTools.length
  const activeCategories = CATEGORIES.filter((c) => getToolsByCategory(c.id).length > 0)

  const quickToolIds = [
    'password-generator',
    'json-formatter',
    'qr-generator',
    'uuid-generator',
    'timestamp-converter',
    'image-converter'
  ]
  const quickTools = quickToolIds
    .map((id) => getTool(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((tool) => ({ tool, icon: getCategory(tool.category)?.icon ?? getCategory('developer')!.icon }))

  const recentToolsList = recentTools
    .slice(0, 6)
    .map((id) => getTool(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Hero — the bench itself */}
      <section style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 520 }}>
          <p
            style={{
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--tb-accent)',
              marginBottom: 10
            }}
          >
            Local-first · Offline · Yours
          </p>
          <h1
            style={{
              fontFamily: 'var(--tb-font-display)',
              fontSize: 34,
              lineHeight: 1.04,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.015em',
              color: 'var(--tb-text)'
            }}
          >
            Every instrument on one bench
          </h1>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--tb-text-secondary)' }}>
            {totalTools} tools that run entirely on this machine — no accounts, no telemetry, no
            network. Pick one below or press{' '}
            <span className="tb-kbd">Ctrl</span> <span className="tb-kbd">K</span> anywhere.
          </p>
        </div>
        <div aria-hidden style={{ textAlign: 'right', paddingRight: 4 }}>
          <div
            style={{
              fontFamily: 'var(--tb-font-display)',
              fontSize: 76,
              lineHeight: 0.9,
              fontWeight: 700,
              color: 'var(--tb-text)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {String(totalTools).padStart(2, '0')}
          </div>
          <div
            style={{
              marginTop: 6,
              width: 96,
              height: 13,
              marginLeft: 'auto',
              backgroundImage:
                'repeating-linear-gradient(to right, var(--tb-ruler-major) 0 1px, transparent 1px 8px), repeating-linear-gradient(to right, var(--tb-accent) 0 2px, transparent 2px 24px)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom left',
              backgroundSize: '100% 7px, 100% 13px'
            }}
          />
          <div
            style={{
              marginTop: 5,
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--tb-text-faint)'
            }}
          >
            Instruments
          </div>
        </div>
      </section>

      <StatStrip
        items={[
          { value: String(activeCategories.length), label: 'Categories' },
          { value: '100%', label: 'Local processing' },
          { value: '0', label: 'Network calls' }
        ]}
      />

      {/* Quick access */}
      <section>
        <h2
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--tb-text-faint)'
          }}
        >
          Quick access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {quickTools.map(({ tool, icon }) => (
            <ToolCard
              key={tool.id}
              icon={icon}
              title={tool.name}
              description={tool.description}
              pinned={favorites.includes(tool.id)}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}
        </div>
      </section>

      {/* Recent strip */}
      {recentToolsList.length > 0 && (
        <section>
          <h2
            style={{
              marginBottom: 14,
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--tb-text-faint)'
            }}
          >
            Recently used
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {recentToolsList.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className="tb-hoverable"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 'var(--tb-radius-ctl)',
                  border: '1px solid var(--tb-border-strong)',
                  backgroundColor: 'var(--tb-raised)',
                  fontSize: 12.5,
                  color: 'var(--tb-text-secondary)'
                }}
              >
                <span aria-hidden style={{ width: 5, height: 5, borderRadius: 1, backgroundColor: 'var(--tb-accent)' }} />
                {tool.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Categories — a manifest, not a card grid */}
      <section>
        <h2
          style={{
            marginBottom: 14,
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--tb-text-faint)'
          }}
        >
          Bench index
        </h2>
        <div className="tb-panel" style={{ padding: '6px 16px' }}>
          {activeCategories.map((category, i) => {
            const tools = getToolsByCategory(category.id)
            const firstTool = tools[0]
            return (
              <button
                key={category.id}
                onClick={() => setActiveTool(firstTool.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 4px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid var(--tb-border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color var(--tb-speed-fast) ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--tb-accent-tint)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span
                  style={{
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 9.5,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    padding: '2px 5px',
                    borderRadius: 2,
                    border: '1px solid var(--tb-border-strong)',
                    color: 'var(--tb-text-secondary)'
                  }}
                >
                  {category.tag}
                </span>
                <category.icon size={15} color="var(--tb-text-secondary)" />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--tb-text)' }}>{category.name}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: 'var(--tb-text-faint)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tools[0].name.toLowerCase()}
                  {tools.length > 1 ? ` +${tools.length - 1} more` : ''}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--tb-font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    color: 'var(--tb-text-faint)'
                  }}
                >
                  ×{String(tools.length).padStart(2, '0')}
                </span>
                <ArrowUpRight size={14} color="var(--tb-text-faint)" />
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
