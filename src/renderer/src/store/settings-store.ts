import { create } from 'zustand'

export interface Settings {
  startupBehavior: 'dashboard' | 'lastTool' | 'minimized'
  showRecentInSidebar: boolean
  theme: 'dark' | 'light' | 'system'
  accentColor: string
}

const SETTINGS_KEY = 'toolbox-pro-settings'
const DEFAULTS: Settings = {
  startupBehavior: 'dashboard',
  showRecentInSidebar: true,
  theme: 'dark',
  accentColor: '#2563EB'
}

interface SettingsState extends Settings {
  updateSettings: (partial: Partial<Settings>) => void
  loadSettings: () => void
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  updateSettings: (partial) => {
    const updated = { ...get(), ...partial }
    set(partial)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  },
  loadSettings: () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) set({ ...DEFAULTS, ...JSON.parse(stored) })
    } catch {}
  }
}))
