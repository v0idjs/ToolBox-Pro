import { Search, Settings, Moon, Sun, Monitor } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { useThemeColors } from '@/lib/theme'
import { useSettings } from '@/store/settings-store'

interface TopNavbarProps {
  onSettingsClick?: () => void
}

export function TopNavbar({ onSettingsClick }: TopNavbarProps) {
  const { setSearchOpen } = useAppStore()
  const colors = useThemeColors()
  const { theme, updateSettings } = useSettings()

  const cycleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    updateSettings({ theme: next })
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        padding: '0 24px',
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.card,
        color: colors.text
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.accent,
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 14
          }}
        >
          TB
        </div>
        <span style={{ fontWeight: 600, fontSize: 16 }}>ToolBox Pro</span>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.input,
          color: colors.textSecondary,
          fontSize: 14,
          cursor: 'pointer'
        }}
      >
        <Search size={14} />
        <span>Search tools...</span>
        <kbd
          style={{
            marginLeft: 16,
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 12,
            backgroundColor: colors.border,
            color: colors.textSecondary
          }}
        >
          Ctrl+K
        </kbd>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ThemeIcon size={18} />
        </button>
        <button
          onClick={onSettingsClick}
          aria-label="Settings"
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
