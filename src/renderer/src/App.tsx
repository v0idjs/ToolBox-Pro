import { useState, useEffect, Component, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardHome } from './pages/DashboardHome'
import { SearchModal } from './components/SearchModal'
import { SettingsPage } from './pages/SettingsPage'
import { useAppStore } from './store/app-store'
import { useSettings } from './store/settings-store'
import { useThemeColors } from './lib/theme'
import { getTool } from './lib/tool-registry'
import { registerSecurityTools } from './tools/security'
import { registerDeveloperTools } from './tools/developer'
import { registerFileTools } from './tools/file'
import { registerImageTools } from './tools/image'
import { registerQRTools } from './tools/qr'
import { registerProductivityTools } from './tools/productivity'

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="tb-panel"
            style={{
              padding: 20,
              borderColor: 'var(--tb-error)',
              fontSize: 13,
              fontFamily: 'var(--tb-font-mono)',
              color: 'var(--tb-error)'
            }}
          >
            This tool hit an error: {this.state.error}
            <span style={{ display: 'block', marginTop: 8, color: 'var(--tb-text-secondary)' }}>
              Switch tools and back to retry.
            </span>
          </div>
        )
      )
    }
    return this.props.children
  }
}

registerSecurityTools()
registerDeveloperTools()
registerFileTools()
registerImageTools()
registerQRTools()
registerProductivityTools()

function BackToDashboard({ onClick }: { onClick: () => void }) {
  const colors = useThemeColors()
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 18,
        padding: '4px 8px 4px 6px',
        borderRadius: 'var(--tb-radius-ctl)',
        border: 'none',
        background: 'transparent',
        fontFamily: 'var(--tb-font-mono)',
        fontSize: 11.5,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: colors.textSecondary,
        cursor: 'pointer',
        transition: 'color var(--tb-speed-fast) ease, background-color var(--tb-speed-fast) ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
      onMouseLeave={(e) => (e.currentTarget.style.color = colors.textSecondary)}
    >
      <ArrowLeft size={13} />
      Back to Dashboard
    </button>
  )
}

function App() {
  const { activeTool, setActiveTool, loadFavorites, loadRecentTools } = useAppStore()
  const { loadSettings } = useSettings()
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard')

  useEffect(() => {
    loadFavorites()
    loadRecentTools()
    loadSettings()
  }, [loadFavorites, loadRecentTools, loadSettings])

  // Keep Escape working as "go back" from settings
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && view === 'settings') setView('dashboard')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view])

  const tool = activeTool && activeTool !== 'home' ? getTool(activeTool) : null

  return (
    <DashboardLayout
      onSettingsClick={() => setView('settings')}
      viewKey={view === 'settings' ? 'settings' : tool?.id ?? 'home'}
    >
      {view === 'settings' ? (
        <div>
          <BackToDashboard onClick={() => setView('dashboard')} />
          <SettingsPage />
        </div>
      ) : tool ? (
        <div>
          <BackToDashboard onClick={() => setActiveTool('home')} />
          <ErrorBoundary>{tool.render()}</ErrorBoundary>
        </div>
      ) : (
        <DashboardHome />
      )}
      <SearchModal />
    </DashboardLayout>
  )
}

export default App
