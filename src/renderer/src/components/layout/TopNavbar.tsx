import { Search, Settings as SettingsIcon, Moon, Sun, Monitor, Wrench } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { useThemeColors } from '@/lib/theme'
import { useSettings } from '@/store/settings-store'
import { getAllTools } from '@/lib/tool-registry'

interface TopNavbarProps {
  onSettingsClick?: () => void
}

const iconButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 'var(--tb-radius-ctl)',
  backgroundColor: 'transparent',
  color: 'var(--tb-text-secondary)',
  border: 'none',
  transition: 'background-color var(--tb-speed-fast) ease, color var(--tb-speed-fast) ease'
}

export function TopNavbar({ onSettingsClick }: TopNavbarProps) {
  const { setSearchOpen } = useAppStore()
  const { theme, updateSettings } = useSettings()
  const toolCount = getAllTools().length

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
        gap: 16,
        height: 52,
        flexShrink: 0,
        padding: '0 16px',
        borderBottom: '1px solid var(--tb-border)',
        backgroundColor: 'var(--tb-card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          aria-hidden
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--tb-radius-ctl)',
            backgroundColor: 'var(--tb-accent)',
            color: 'var(--tb-on-accent)'
          }}
        >
          <Wrench size={15} strokeWidth={2.2} />
        </div>
        <span
          style={{
            fontFamily: 'var(--tb-font-display)',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--tb-text)'
          }}
        >
          ToolBox
        </span>
        <span
          aria-hidden
          style={{
            fontFamily: 'var(--tb-font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            padding: '2px 5px',
            borderRadius: 3,
            border: '1px solid var(--tb-border-strong)',
            color: 'var(--tb-accent)'
          }}
        >
          PRO
        </span>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        data-testid="open-search"
        aria-label={`Search ${toolCount} tools`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 'min(420px, 40vw)',
          padding: '6px 10px',
          borderRadius: 'var(--tb-radius-ctl)',
          border: '1px solid var(--tb-border)',
          backgroundColor: 'var(--tb-raised)',
          color: 'var(--tb-text-faint)',
          fontSize: 13,
          transition: 'border-color var(--tb-speed-fast) ease'
        }}
      >
        <Search size={14} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search {toolCount} tools…</span>
        <span className="tb-kbd" aria-hidden>
          Ctrl K
        </span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={cycleTheme}
          data-testid="theme-toggle"
          title={`Theme: ${theme}`}
          aria-label={`Theme: ${theme}. Click to switch.`}
          style={iconButtonStyle}
        >
          <ThemeIcon size={16} />
        </button>
        <button onClick={onSettingsClick} aria-label="Open settings" style={iconButtonStyle}>
          <SettingsIcon size={16} />
        </button>
      </div>
    </header>
  )
}
