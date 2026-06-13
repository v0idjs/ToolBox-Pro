import { create } from 'zustand'

interface AppState {
  activeTool: string | null
  searchQuery: string
  searchOpen: boolean
  favorites: string[]
  recentTools: string[]

  setActiveTool: (toolId: string | null) => void
  setSearchQuery: (query: string) => void
  setSearchOpen: (open: boolean) => void
  toggleFavorite: (toolId: string) => void
  addRecentTool: (toolId: string) => void
  loadFavorites: () => void
  loadRecentTools: () => void
}

const FAVORITES_KEY = 'toolbox-pro-favorites'
const RECENT_KEY = 'toolbox-pro-recent'

export const useAppStore = create<AppState>((set, get) => ({
  activeTool: null,
  searchQuery: '',
  searchOpen: false,
  favorites: [],
  recentTools: [],

  setActiveTool: (toolId) => {
    set({ activeTool: toolId })
    if (toolId && toolId !== 'home') {
      get().addRecentTool(toolId)
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ searchOpen: open }),

  toggleFavorite: (toolId) => {
    const current = get().favorites
    const updated = current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId]
    set({ favorites: updated })
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  },

  addRecentTool: (toolId) => {
    const current = get().recentTools.filter((id) => id !== toolId)
    const updated = [toolId, ...current].slice(0, 20)
    set({ recentTools: updated })
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  },

  loadFavorites: () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) set({ favorites: JSON.parse(stored) })
    } catch {}
  },

  loadRecentTools: () => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) set({ recentTools: JSON.parse(stored) })
    } catch {}
  }
}))
