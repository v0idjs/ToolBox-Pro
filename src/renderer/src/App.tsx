import { useState, useEffect, Component, type ReactNode } from 'react'
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
import { ArrowLeft } from 'lucide-react'

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
          <div style={{ padding: 20, color: '#EF4444', fontSize: 14 }}>
            Error: {this.state.error}
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

function App() {
  const { activeTool, setActiveTool, loadFavorites, loadRecentTools } = useAppStore()
  const { loadSettings } = useSettings()
  const colors = useThemeColors()
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard')

  useEffect(() => {
    loadFavorites()
    loadRecentTools()
    loadSettings()
  }, [loadFavorites, loadRecentTools, loadSettings])

  const tool = activeTool && activeTool !== 'home' ? getTool(activeTool) : null

  return (
    <DashboardLayout onSettingsClick={() => setView('settings')}>
      {view === 'settings' ? (
        <div>
          <button
            onClick={() => setView('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: colors.textSecondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 16
            }}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <SettingsPage />
        </div>
      ) : tool ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button
            onClick={() => setActiveTool('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: colors.textSecondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
              {tool.name}
            </h1>
            <p style={{ fontSize: 14, marginTop: 4, color: colors.textSecondary }}>
              {tool.description}
            </p>
          </div>
          <ErrorBoundary>
            <div
              style={{
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: 24,
                backgroundColor: colors.card
              }}
            >
              {tool.render()}
            </div>
          </ErrorBoundary>
        </div>
      ) : (
        <DashboardHome />
      )}
      <SearchModal />
    </DashboardLayout>
  )
}

export default App
