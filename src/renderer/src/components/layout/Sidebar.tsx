import { Home, ChevronLeft, ChevronRight, Star, History } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { useSettings } from '@/store/settings-store'
import { getAllTools } from '@/lib/tool-registry'
import { CATEGORIES } from '@/lib/categories'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function Led({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 6,
        height: 6,
        flexShrink: 0,
        borderRadius: 1,
        backgroundColor: lit ? 'var(--tb-accent)' : 'transparent',
        boxShadow: lit ? '0 0 6px var(--tb-accent-tint)' : 'none',
        border: lit ? 'none' : '1px solid var(--tb-border-strong)'
      }}
    />
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { activeTool, setActiveTool, favorites, recentTools } = useAppStore()
  const { showRecentInSidebar } = useSettings()
  const allTools = getAllTools()
  const favoriteTools = allTools.filter((t) => favorites.includes(t.id))
  const recentList = recentTools
    .filter((id) => !favorites.includes(id))
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 5)

  const isHome = activeTool === 'home' || activeTool === null || activeTool === undefined

  const navButtonStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: collapsed ? '7px 0' : '5.5px 8px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontSize: 13.5,
    textAlign: 'left',
    borderRadius: 'var(--tb-radius-ctl)',
    backgroundColor: active ? 'var(--tb-accent-tint)' : 'transparent',
    color: active ? 'var(--tb-text)' : 'var(--tb-text-secondary)',
    border: 'none',
    transition: 'background-color var(--tb-speed-fast) ease, color var(--tb-speed-fast) ease'
  })

  const groupLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: collapsed ? '14px 0 4px' : '16px 8px 5px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'var(--tb-text-faint)'
  }

  return (
    <aside
      data-testid="sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: collapsed ? 56 : 236,
        flexShrink: 0,
        borderRight: '1px solid var(--tb-border)',
        backgroundColor: 'var(--tb-card)',
        transition: 'width var(--tb-speed) ease',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '10px 0' : '10px 8px 10px 12px',
          borderBottom: '1px solid var(--tb-border)'
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--tb-text-faint)'
            }}
          >
            Index
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          style={iconBtn}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 8px 16px' }}>
        <button onClick={() => setActiveTool('home')} data-testid="sidebar-home" style={navButtonStyle(isHome)}>
          <Led lit={isHome} />
          {collapsed ? <Home size={16} /> : (
            <>
              <Home size={14} />
              <span>Dashboard</span>
            </>
          )}
        </button>

        {!collapsed && favoriteTools.length > 0 && (
          <>
            <div style={groupLabelStyle}>
              <Star size={11} />
              <span>Pinned</span>
            </div>
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                data-testid={`sidebar-tool-${tool.id}`}
                style={navButtonStyle(activeTool === tool.id)}
              >
                <Led lit={activeTool === tool.id} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tool.name}
                </span>
              </button>
            ))}
          </>
        )}

        {!collapsed && showRecentInSidebar && recentList.length > 0 && (
          <>
            <div style={groupLabelStyle}>
              <History size={11} />
              <span>Recent</span>
            </div>
            {recentList.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                data-testid={`sidebar-tool-${tool.id}`}
                style={navButtonStyle(activeTool === tool.id)}
              >
                <Led lit={activeTool === tool.id} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tool.name}
                </span>
              </button>
            ))}
          </>
        )}

        {CATEGORIES.map((category) => {
          if (collapsed) {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                title={category.name}
                aria-label={category.name}
                style={{ ...groupLabelStyle, width: '100%', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <Icon size={15} />
              </button>
            )
          }
          const categoryTools = allTools.filter((t) => t.category === category.id)
          if (categoryTools.length === 0) return null

          return (
            <div key={category.id}>
              <div style={groupLabelStyle} data-testid={`sidebar-category-${category.id}`}>
                <span
                  style={{
                    padding: '1px 4px',
                    borderRadius: 2,
                    border: '1px solid var(--tb-border-strong)',
                    fontSize: 9,
                    color: 'var(--tb-text-secondary)'
                  }}
                >
                  {category.tag}
                </span>
                <span>{category.name}</span>
                <span style={{ marginLeft: 'auto', letterSpacing: '0.06em' }}>
                  ×{String(categoryTools.length).padStart(2, '0')}
                </span>
              </div>
              {categoryTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  data-testid={`sidebar-tool-${tool.id}`}
                  style={navButtonStyle(activeTool === tool.id)}
                >
                  <Led lit={activeTool === tool.id} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

const iconBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 26,
  height: 26,
  borderRadius: 'var(--tb-radius-ctl)',
  backgroundColor: 'transparent',
  color: 'var(--tb-text-secondary)',
  border: 'none'
}
