import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { searchTools } from '@/lib/tool-registry'
import { useAppStore } from '@/store/app-store'
import { useThemeColors } from '@/lib/theme'
import type { ToolModule } from '@/types/tool'

export function SearchModal() {
  const { searchOpen, setSearchOpen, setActiveTool } = useAppStore()
  const colors = useThemeColors()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolModule[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setResults([])
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  useEffect(() => {
    if (query.trim()) {
      setResults(searchTools(query))
      setSelectedIdx(0)
    } else {
      setResults([])
    }
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      setActiveTool(results[selectedIdx].id)
      setSearchOpen(false)
    }
  }

  if (!searchOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh' }}>
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={() => setSearchOpen(false)}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 512,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          backgroundColor: colors.card
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
          <Search size={18} color={colors.textSecondary} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, backgroundColor: 'transparent', outline: 'none', fontSize: 14, color: colors.text, border: 'none' }}
          />
          <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color={colors.textSecondary} />
          </button>
        </div>

        {results.length > 0 && (
          <div style={{ maxHeight: 256, overflowY: 'auto', padding: '8px 0' }}>
            {results.map((tool, idx) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id)
                  setSearchOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: idx === selectedIdx ? colors.border : 'transparent',
                  color: colors.text,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.accent,
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                >
                  {tool.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{tool.name}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    {tool.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 14, color: colors.textSecondary }}>
            No tools found for "{query}"
          </div>
        )}

        {!query && (
          <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 14, color: colors.textSecondary }}>
            Start typing to search tools...
          </div>
        )}
      </div>
    </div>
  )
}
