import { useEffect, useState } from 'react'
import { useSettings, DEFAULT_ACCENT } from '@/store/settings-store'

export { DEFAULT_ACCENT }

export interface ThemeColors {
  bg: string
  bgDeep: string
  card: string
  raised: string
  border: string
  borderStrong: string
  text: string
  textSecondary: string
  textFaint: string
  accent: string
  accentHover: string
  accentTint: string
  onAccent: string
  /** legacy alias — same as `raised` */
  input: string
  success: string
  warning: string
  error: string
}

interface Palette {
  bg: string
  bgDeep: string
  card: string
  raised: string
  border: string
  borderStrong: string
  text: string
  textSecondary: string
  textFaint: string
  success: string
  warning: string
  error: string
}

const darkPalette: Palette = {
  bg: '#101214',
  bgDeep: '#0C0E10',
  card: '#17191D',
  raised: '#1F2226',
  border: '#2A2E34',
  borderStrong: '#3B4047',
  text: '#E9E7E1',
  textSecondary: '#9AA1A8',
  textFaint: '#70767D',
  success: '#66BE7C',
  warning: '#E0B341',
  error: '#E85C52'
}

const lightPalette: Palette = {
  bg: '#E2E3DF',
  bgDeep: '#D6D8D3',
  card: '#F7F6F2',
  raised: '#FFFFFF',
  border: '#CFD2CB',
  borderStrong: '#B4B8AF',
  text: '#1D1F1B',
  textSecondary: '#5D6259',
  textFaint: '#878C82',
  success: '#2E6B3C',
  warning: '#8A5D06',
  error: '#BC3A31'
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(value, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Ink color that stays readable on top of any accent, user-chosen included. */
export function readableOnAccent(hex: string): string {
  return relativeLuminance(hex) > 0.4 ? '#161207' : '#FFF9EF'
}

function mixToward(hex: string, goal: number, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  const mix = (v: number) => Math.round(v + (goal - v) * amount)
  const to = (v: number) => mix(v).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function lighten(hex: string, amount: number): string {
  return mixToward(hex, 255, amount)
}

function darken(hex: string, amount: number): string {
  return mixToward(hex, 0, amount)
}

function rgbaFrom(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return prefersDark
}

export function useThemeColors(): ThemeColors {
  const { theme, accentColor } = useSettings()
  const prefersDark = useSystemPrefersDark()
  const isDark = theme === 'light' ? false : theme === 'system' ? prefersDark : true

  const base = isDark ? darkPalette : lightPalette

  // Custom accents keep their hue; the accent deepens on light surfaces for contrast.
  const rawAccent = accentColor || DEFAULT_ACCENT
  const accent = isDark ? rawAccent : darken(rawAccent, 0.25)
  const accentHover = isDark ? lighten(accent, 0.14) : darken(accent, 0.12)
  const onAccent = readableOnAccent(accent)
  const accentTint = rgbaFrom(rawAccent, isDark ? 0.13 : 0.15)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = isDark ? 'dark' : 'light'
    root.style.setProperty('--tb-accent', accent)
    root.style.setProperty('--tb-accent-hover', accentHover)
    root.style.setProperty('--tb-on-accent', onAccent)
    root.style.setProperty('--tb-accent-tint', accentTint)
  }, [isDark, accent, accentHover, onAccent, accentTint])

  return {
    ...base,
    accent,
    accentHover,
    accentTint,
    onAccent,
    input: base.raised
  }
}
