import React, { useState } from 'react'
import { Settings, Monitor, Moon, Sun, Palette, Trash2, Save } from 'lucide-react'
import { useSettings } from '../store/settings-store'
import { useThemeColors } from '../lib/theme'

const ACCENT_PRESETS = [
  { label: 'Blue', value: '#2563EB' },
  { label: 'Green', value: '#10B981' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F59E0B' },
  { label: 'Pink', value: '#EC4899' },
]

export function SettingsPage() {
  const { startupBehavior, showRecentInSidebar, theme, accentColor, updateSettings, loadSettings } = useSettings()
  const colors = useThemeColors()
  const [activeTab, setActiveTab] = useState<'general' | 'appearance'>('general')
  const [customColor, setCustomColor] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  React.useEffect(() => {
    loadSettings()
  }, [])

  const handleClearData = () => {
    localStorage.removeItem('toolbox-pro-favorites')
    localStorage.removeItem('toolbox-pro-recent')
    localStorage.removeItem('toolbox-pro-notes')
    localStorage.removeItem('toolbox-pro-todos')
    setSaveMessage('All data cleared!')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const handleSave = () => {
    setSaveMessage('Settings saved!')
    setTimeout(() => setSaveMessage(''), 2000)
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ]

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 24,
  }

  const labelStyle: React.CSSProperties = {
    color: colors.text,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    display: 'block',
  }

  const descriptionStyle: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  }

  const radioOptionStyle = (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${selected ? accentColor : colors.border}`,
    backgroundColor: selected ? `${accentColor}15` : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  })

  const radioDotStyle = (selected: boolean): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `2px solid ${selected ? accentColor : colors.textSecondary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  })

  const radioInnerDot = (selected: boolean): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: selected ? accentColor : 'transparent',
  })

  const toggleContainerStyle = (enabled: boolean): React.CSSProperties => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: enabled ? accentColor : colors.textSecondary,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    flexShrink: 0,
  })

  const toggleKnobStyle = (enabled: boolean): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: colors.text,
    position: 'absolute',
    top: 3,
    left: enabled ? 23 : 3,
    transition: 'left 0.2s',
  })

  const colorSwatchStyle = (color: string, selected: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: color,
    border: `2px solid ${selected ? colors.text : 'transparent'}`,
    cursor: 'pointer',
    outline: selected ? `2px solid ${color}` : 'none',
    outlineOffset: 2,
  })

  const buttonStyle = (variant: 'primary' | 'danger'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: variant === 'danger' ? '#EF4444' : accentColor,
    color: colors.text,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  })

  return (
    <div style={{ padding: 32, backgroundColor: colors.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Settings size={28} color={colors.text} />
          <h1 style={{ color: colors.text, fontSize: 24, fontWeight: 700, margin: 0 }}>Settings</h1>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, backgroundColor: colors.card, borderRadius: 10, padding: 4 }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isActive ? accentColor : 'transparent',
                  color: isActive ? colors.text : colors.textSecondary,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {saveMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: '#10B98120',
            border: '1px solid #10B981',
            color: '#10B981',
            fontSize: 14,
            marginBottom: 20,
          }}>
            {saveMessage}
          </div>
        )}

        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <label style={labelStyle}>Startup Behavior</label>
              <p style={descriptionStyle}>Choose what happens when the app launches.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'dashboard' as const, label: 'Open Dashboard', desc: 'Show the main dashboard' },
                  { value: 'lastTool' as const, label: 'Open Last Tool', desc: 'Resume with your last tool' },
                  { value: 'minimized' as const, label: 'Open Minimized', desc: 'Start minimized to tray' },
                ].map((option) => (
                  <div
                    key={option.value}
                    style={radioOptionStyle(startupBehavior === option.value)}
                    onClick={() => updateSettings({ startupBehavior: option.value })}
                  >
                    <div style={radioDotStyle(startupBehavior === option.value)}>
                      <div style={radioInnerDot(startupBehavior === option.value)} />
                    </div>
                    <div>
                      <div style={{ color: colors.text, fontSize: 14, fontWeight: 500 }}>{option.label}</div>
                      <div style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{option.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Show Recent Tools in Sidebar</label>
                  <p style={{ ...descriptionStyle, marginBottom: 0, marginTop: 4 }}>Display recently used tools in the sidebar.</p>
                </div>
                <div
                  style={toggleContainerStyle(showRecentInSidebar)}
                  onClick={() => updateSettings({ showRecentInSidebar: !showRecentInSidebar })}
                >
                  <div style={toggleKnobStyle(showRecentInSidebar)} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <label style={labelStyle}>Danger Zone</label>
              <p style={descriptionStyle}>Permanently delete all stored data including favorites, recent tools, notes, and todos.</p>
              <button style={buttonStyle('danger')} onClick={handleClearData}>
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <label style={labelStyle}>Theme</label>
              <p style={descriptionStyle}>Select your preferred color theme.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'dark' as const, label: 'Dark', icon: Moon },
                  { value: 'light' as const, label: 'Light', icon: Sun },
                  { value: 'system' as const, label: 'System', icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  return (
                    <div
                      key={option.value}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '14px 12px',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? accentColor : colors.border}`,
                        backgroundColor: isSelected ? `${accentColor}15` : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => updateSettings({ theme: option.value })}
                    >
                      <Icon size={20} color={isSelected ? accentColor : colors.textSecondary} />
                      <span style={{ color: isSelected ? colors.text : colors.textSecondary, fontSize: 13, fontWeight: 500 }}>
                        {option.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={cardStyle}>
              <label style={labelStyle}>Accent Color</label>
              <p style={descriptionStyle}>Customize the primary accent color throughout the app.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                {ACCENT_PRESETS.map((preset) => (
                  <div
                    key={preset.value}
                    title={preset.label}
                    style={colorSwatchStyle(preset.value, accentColor === preset.value)}
                    onClick={() => updateSettings({ accentColor: preset.value })}
                  />
                ))}
                <div style={{ position: 'relative' }}>
                  <div
                    title="Custom"
                    style={{
                      ...colorSwatchStyle(customColor || '#6B7280', !ACCENT_PRESETS.some(p => p.value === accentColor)),
                      overflow: 'hidden',
                    }}
                  >
                    <input
                      type="color"
                      value={customColor || accentColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value)
                        updateSettings({ accentColor: e.target.value })
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: accentColor }} />
                <span style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'monospace' }}>{accentColor}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={buttonStyle('primary')} onClick={handleSave}>
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
