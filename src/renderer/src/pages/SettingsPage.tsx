import { useState } from 'react'
import { Settings as SettingsIcon, Moon, Sun, Monitor, Check } from 'lucide-react'
import { useSettings, DEFAULT_ACCENT } from '../store/settings-store'
import { useThemeColors } from '../lib/theme'
import { Card, SectionLabel, Toggle, Button } from '@/components/ui'

const ACCENT_PRESETS = [
  { label: 'Amber', value: DEFAULT_ACCENT },
  { label: 'Cobalt', value: '#4C7EF3' },
  { label: 'Verdigris', value: '#3FA98E' },
  { label: 'Signal Red', value: '#E85C52' },
  { label: 'Violet', value: '#9B7BD4' },
  { label: 'Rose', value: '#D16A93' }
]

export function SettingsPage() {
  const { startupBehavior, showRecentInSidebar, theme, accentColor, updateSettings } = useSettings()
  const colors = useThemeColors()
  const [activeTab, setActiveTab] = useState<'general' | 'appearance'>('general')
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearData = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 4000)
      return
    }
    localStorage.removeItem('toolbox-pro-favorites')
    localStorage.removeItem('toolbox-pro-recent')
    localStorage.removeItem('toolbox-pro-notes')
    localStorage.removeItem('toolbox-pro-todos')
    window.location.reload()
  }

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'appearance' as const, label: 'Appearance' }
  ]

  return (
    <div data-testid="settings-page" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--tb-radius-panel)',
            border: '1px solid var(--tb-border-strong)',
            backgroundColor: 'var(--tb-accent-tint)',
            color: 'var(--tb-accent)'
          }}
        >
          <SettingsIcon size={19} strokeWidth={1.8} />
        </span>
        <div>
          <h1
            style={{
              fontFamily: 'var(--tb-font-display)',
              fontSize: 26,
              lineHeight: 1.05,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              color: 'var(--tb-text)'
            }}
          >
            Settings
          </h1>
          <p style={{ marginTop: 4, fontSize: 13.5, color: 'var(--tb-text-secondary)' }}>
            Changes apply immediately.
          </p>
        </div>
      </div>

      {/* Tabs — underline style */}
      <div
        style={{
          display: 'flex',
          gap: 22,
          borderBottom: '1px solid var(--tb-border)',
          marginBottom: 24
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={isActive}
              role="tab"
              style={{
                padding: '8px 2px 10px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--tb-accent)' : 'transparent'}`,
                marginBottom: -1,
                fontFamily: 'var(--tb-font-mono)',
                fontSize: 11.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isActive ? 'var(--tb-text)' : 'var(--tb-text-faint)',
                cursor: 'pointer',
                transition: 'color var(--tb-speed-fast) ease'
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <SectionLabel>Startup behavior</SectionLabel>
            <div
              role="radiogroup"
              aria-label="Startup behavior"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {[
                { value: 'dashboard' as const, label: 'Open Dashboard', desc: 'Show the main dashboard' },
                { value: 'lastTool' as const, label: 'Open Last Tool', desc: 'Resume with your last tool' },
                { value: 'minimized' as const, label: 'Open Minimized', desc: 'Start minimized to tray' }
              ].map((option) => {
                const selected = startupBehavior === option.value
                return (
                  <button
                    key={option.value}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateSettings({ startupBehavior: option.value })}
                    className="tb-hoverable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 'var(--tb-radius-ctl)',
                      backgroundColor: selected ? colors.accentTint : colors.raised,
                      border: `1px solid ${selected ? colors.accent : colors.border}`
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 15,
                        height: 15,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: `2px solid ${selected ? colors.accent : colors.borderStrong}`,
                        color: colors.onAccent,
                        backgroundColor: selected ? colors.accent : 'transparent'
                      }}
                    >
                      {selected && <Check size={9} strokeWidth={3.5} />}
                    </span>
                    <span style={{ textAlign: 'left' }}>
                      <span style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: colors.text }}>
                        {option.label}
                      </span>
                      <span style={{ display: 'block', fontSize: 12, marginTop: 1, color: colors.textSecondary }}>
                        {option.desc}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <SectionLabel>Sidebar</SectionLabel>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: colors.text }}>Show recent tools</p>
                <p style={{ fontSize: 12.5, marginTop: 2, color: colors.textSecondary }}>
                  List recently used tools above the categories.
                </p>
              </div>
              <Toggle
                checked={showRecentInSidebar}
                onChange={(v) => updateSettings({ showRecentInSidebar: v })}
                label="Show recent tools in sidebar"
              />
            </div>
          </Card>

          <Card className="tb-hazard-top" style={{ paddingTop: 24 }}>
            <SectionLabel>Danger zone</SectionLabel>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: colors.text }}>Clear all local data</p>
            <p style={{ fontSize: 12.5, margin: '2px 0 14px', color: colors.textSecondary }}>
              Permanently deletes favorites, recent tools, notes, and to-dos from this machine.
            </p>
            <Button variant={confirmClear ? 'danger' : 'secondary'} onClick={handleClearData}>
              {confirmClear ? 'Click again to confirm' : 'Clear all data'}
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <SectionLabel>Theme</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { value: 'dark' as const, label: 'Graphite', icon: Moon },
                { value: 'light' as const, label: 'Zinc', icon: Sun },
                { value: 'system' as const, label: 'System', icon: Monitor }
              ].map((option) => {
                const Icon = option.icon
                const selected = theme === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ theme: option.value })}
                    aria-pressed={selected}
                    className="tb-hoverable"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: 12,
                      borderRadius: 'var(--tb-radius-panel)',
                      backgroundColor: selected ? colors.accentTint : colors.raised,
                      border: `1px solid ${selected ? colors.accent : colors.border}`
                    }}
                  >
                    {/* mini bench preview */}
                    <span
                      aria-hidden
                      style={{
                        height: 34,
                        borderRadius: 'var(--tb-radius-ctl)',
                        border: '1px solid var(--tb-border)',
                        backgroundColor:
                          option.value === 'dark' ? '#17191D' : option.value === 'light' ? '#F7F6F2' : colors.card,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage:
                          option.value === 'light'
                            ? 'linear-gradient(to right, transparent 78%, rgba(0,0,0,0.05) 78%)'
                            : option.value === 'dark'
                              ? 'linear-gradient(to right, transparent 78%, rgba(255,255,255,0.06) 78%)'
                              : 'none'
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 6,
                          top: 6,
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          backgroundColor: 'var(--tb-accent)'
                        }}
                      />
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: selected ? colors.text : colors.textSecondary
                      }}
                    >
                      <Icon size={13} color={selected ? colors.accent : colors.textFaint} />
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <SectionLabel hint={accentColor.toUpperCase()}>Accent color</SectionLabel>
            <p style={{ fontSize: 12.5, marginBottom: 14, color: colors.textSecondary }}>
              Tints panels and lights the active indicator.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              {ACCENT_PRESETS.map((preset) => {
                const selected = accentColor.toLowerCase() === preset.value.toLowerCase()
                return (
                  <button
                    key={preset.value}
                    title={preset.label}
                    aria-label={`Accent: ${preset.label}`}
                    aria-pressed={selected}
                    onClick={() => updateSettings({ accentColor: preset.value })}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 'var(--tb-radius-ctl)',
                      backgroundColor: preset.value,
                      cursor: 'pointer',
                      outline: selected ? `2px solid ${colors.text}` : 'none',
                      outlineOffset: 2,
                      border: 'none'
                    }}
                  />
                )
              })}
              <label
                title="Custom color"
                style={{
                  position: 'relative',
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--tb-radius-ctl)',
                  border: `1px dashed ${colors.borderStrong}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textSecondary,
                  fontSize: 15,
                  lineHeight: 1
                }}
              >
                +
                <input
                  type="color"
                  aria-label="Custom accent color"
                  value={accentColor}
                  onChange={(e) => updateSettings({ accentColor: e.target.value })}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                aria-hidden
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: colors.accent,
                  border: '1px solid var(--tb-border-strong)'
                }}
              />
              <span style={{ fontFamily: 'var(--tb-font-mono)', fontSize: 12, color: colors.textSecondary }}>
                {accentColor.toUpperCase()}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
