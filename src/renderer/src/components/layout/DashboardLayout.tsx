import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { useThemeColors } from '@/lib/theme'
import { pageVariants, defaultTransition } from '@/lib/animations'

interface DashboardLayoutProps {
  children: React.ReactNode
  onSettingsClick?: () => void
  activeTool?: string
}

export function DashboardLayout({ children, onSettingsClick, activeTool }: DashboardLayoutProps) {
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
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool || 'default'}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={defaultTransition}
              style={{ height: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
