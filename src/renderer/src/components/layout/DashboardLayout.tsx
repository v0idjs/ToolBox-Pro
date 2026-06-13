import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { useThemeColors } from '@/lib/theme'

interface DashboardLayoutProps {
  children: React.ReactNode
  onSettingsClick?: () => void
}

export function DashboardLayout({ children, onSettingsClick }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const colors = useThemeColors()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bg, color: colors.text }}>
      <TopNavbar onSettingsClick={onSettingsClick} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{children}</main>
      </div>
    </div>
  )
}
