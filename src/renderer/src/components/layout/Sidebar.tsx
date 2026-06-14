import {
  Shield,
  Code,
  FileText,
  Image,
  QrCode,
  Clock,
  Home,
  ChevronLeft,
  ChevronRight,
  Star,
  type LucideIcon
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { getAllTools } from '@/lib/tool-registry'
import { useThemeColors } from '@/lib/theme'

interface Category {
  id: string
  name: string
  icon: LucideIcon
}

const categories: Category[] = [
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'developer', name: 'Developer Tools', icon: Code },
  { id: 'text', name: 'Text Tools', icon: FileText },
  { id: 'file', name: 'File Tools', icon: FileText },
  { id: 'image', name: 'Image Tools', icon: Image },
  { id: 'qr', name: 'QR & Barcode', icon: QrCode },
  { id: 'productivity', name: 'Productivity', icon: Clock }
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { activeTool, setActiveTool, favorites } = useAppStore()
  const colors = useThemeColors()
  const allTools = getAllTools()
  const favoriteTools = allTools.filter((t) => favorites.includes(t.id))

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: collapsed ? 64 : 280,
        borderRight: `1px solid ${colors.border}`,
        backgroundColor: colors.card,
        color: colors.text,
        transition: 'width 0.3s',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 14, fontWeight: 600 }}>Navigation</span>
        )}
        <button
          onClick={onToggle}
          style={{
            padding: 6,
            borderRadius: 8,
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <button
          onClick={() => setActiveTool('home')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            fontSize: 15,
            backgroundColor: 'transparent',
            color: activeTool === 'home' || activeTool === null ? colors.accent : colors.textSecondary,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Home size={18} />
          {!collapsed && <span>Dashboard</span>}
        </button>

        {!collapsed && favoriteTools.length > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              padding: '12px 16px',
              fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: colors.textSecondary,
                marginTop: 8
              }}
            >
              <Star size={14} />
              <span>Favorites</span>
            </div>
            {favoriteTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  paddingLeft: 44,
                  paddingRight: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontSize: 14,
                  backgroundColor: 'transparent',
                  color: activeTool === tool.id ? colors.accent : colors.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{tool.name}</span>
              </button>
            ))}
            <div style={{ margin: '8px 12px', borderTop: `1px solid ${colors.border}` }} />
          </>
        )}

        {categories.map((category) => {
          const categoryTools = allTools.filter((t) => t.category === category.id)
          if (categoryTools.length === 0) return null

          return (
            <div key={category.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: colors.textSecondary
                }}
              >
                <category.icon size={14} />
                {!collapsed && <span>{category.name}</span>}
              </div>
              {!collapsed &&
                categoryTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      paddingLeft: 44,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      fontSize: 14,
                      backgroundColor: 'transparent',
                      color: activeTool === tool.id ? colors.accent : colors.textSecondary,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{tool.name}</span>
                  </button>
                ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
