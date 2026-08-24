import { useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { pageVariants, defaultTransition } from '@/lib/animations'

interface DashboardLayoutProps {
  children: React.ReactNode
  onSettingsClick?: () => void
  /** View identity — drives the page transition. */
  viewKey?: string
}

export function DashboardLayout({ children, onSettingsClick, viewKey }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'var(--tb-bg)',
          color: 'var(--tb-text)'
        }}
      >
        <TopNavbar onSettingsClick={onSettingsClick} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              position: 'relative'
            }}
          >
            {/* Calibration ruler — the bench's signature rail */}
            <div className="tb-ruler" aria-hidden />
            <main
              data-testid="tool-content"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '28px 36px 56px'
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={viewKey || 'default'}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={defaultTransition}
                  style={{ maxWidth: 1060, margin: '0 auto' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
