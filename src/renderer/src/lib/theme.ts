import { useSettings } from '@/store/settings-store'

export interface ThemeColors {
  bg: string
  card: string
  border: string
  text: string
  textSecondary: string
  accent: string
  accentHover: string
  input: string
  success: string
  warning: string
  error: string
}

const darkColors: ThemeColors = {
  bg: '#090E1A',
  card: '#121827',
  border: '#1E293B',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  input: '#0F172A',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444'
}

const lightColors: ThemeColors = {
  bg: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  input: '#F8FAFC',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444'
}

export function useThemeColors(): ThemeColors {
  const { theme, accentColor } = useSettings()

  let isDark = true
  if (theme === 'light') {
    isDark = false
  } else if (theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const base = isDark ? darkColors : lightColors

  return {
    ...base,
    accent: accentColor,
    accentHover: accentColor + 'DD',
  }
}

export function getThemeColors(theme: 'dark' | 'light'): ThemeColors {
  return theme === 'dark' ? darkColors : lightColors
}

export function applyAccentColor(color: string): void {
  document.documentElement.style.setProperty('--color-accent', color)
  document.documentElement.style.setProperty('--color-accent-hover', color + 'DD')
}
