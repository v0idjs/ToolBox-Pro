import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { searchTools } from '@/lib/tool-registry'
import { useAppStore } from '@/store/app-store'
import { getCategory } from '@/lib/categories'
import { modalVariants, backdropVariants, defaultTransition } from '@/lib/animations'
import type { ToolModule } from '@/types/tool'

export function SearchModal() {
  const { searchOpen, setSearchOpen, setActiveTool, favorites } = useAppStore()
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
      const searchResults = searchTools(query)
      const sortedResults = searchResults.sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 0 : 1
        const bFav = favorites.includes(b.id) ? 0 : 1
        return aFav - bFav
      })
      setResults(sortedResults)
      setSelectedIdx(0)
    } else {
      setResults([])
    }
  }, [query, favorites])

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

  return (
    <AnimatePresence>
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '18vh'
          }}
        >
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={defaultTransition}
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(6, 7, 8, 0.62)',
              backdropFilter: 'blur(2px)'
            }}
          />
          <motion.div
            data-testid="search-modal"
            role="dialog"
            aria-label="Search tools"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={defaultTransition}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 560,
              borderRadius: 'var(--tb-radius-modal)',
              border: '1px solid var(--tb-border-strong)',
              boxShadow: 'var(--tb-shadow-modal)',
              overflow: 'hidden',
              backgroundColor: 'var(--tb-card)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '13px 16px',
                borderBottom: '1px solid var(--tb-border)'
              }}
            >
              <Search size={17} color="var(--tb-text-faint)" />
              <input
                ref={inputRef}
                data-testid="search-input"
                type="text"
                placeholder="Find an instrument…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: 14.5,
                  color: 'var(--tb-text)',
                  border: 'none'
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                style={{
                  display: 'flex',
                  padding: 4,
                  background: 'none',
                  border: 'none',
                  borderRadius: 3,
                  color: 'var(--tb-text-faint)'
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '6px' }}>
              {results.map((tool, idx) => {
                const meta = getCategory(tool.category)
                const TagIcon = meta?.icon
                return (
                  <button
                    key={tool.id}
                    data-testid="search-result"
                    onClick={() => {
                      setActiveTool(tool.id)
                      setSearchOpen(false)
                    }}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 10px',
                      fontSize: 13.5,
                      textAlign: 'left',
                      borderRadius: 'var(--tb-radius-ctl)',
                      backgroundColor: idx === selectedIdx ? 'var(--tb-accent-tint)' : 'transparent',
                      color: 'var(--tb-text)',
                      border: 'none'
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 7,
                        height: 7,
                        flexShrink: 0,
                        borderRadius: 1,
                        backgroundColor:
                          idx === selectedIdx ? 'var(--tb-accent)' : 'var(--tb-border-strong)'
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>{tool.name}</span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: 'var(--tb-text-faint)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tool.description}
                    </span>
                    {favorites.includes(tool.id) && (
                      <span aria-label="Pinned" style={{ color: 'var(--tb-accent)', fontSize: 11 }}>
                        ◆
                      </span>
                    )}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        flexShrink: 0,
                        fontFamily: 'var(--tb-font-mono)',
                        fontSize: 9.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--tb-text-faint)'
                      }}
                    >
                      {TagIcon && <TagIcon size={11} />}
                      {meta?.tag ?? tool.category}
                    </span>
                  </button>
                )
              })}

              {query && results.length === 0 && (
                <div
                  style={{
                    padding: '36px 16px 30px',
                    textAlign: 'center',
                    color: 'var(--tb-text-secondary)'
                  }}
                >
                  <p style={{ fontSize: 13.5 }}>No tools found for “{query}”</p>
                  <p
                    style={{
                      marginTop: 6,
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 11,
                      color: 'var(--tb-text-faint)'
                    }}
                  >
                    Try a tool name, category, or keyword
                  </p>
                </div>
              )}

              {!query && (
                <div
                  style={{
                    padding: '36px 16px 30px',
                    textAlign: 'center',
                    color: 'var(--tb-text-secondary)',
                    fontSize: 13.5
                  }}
                >
                  Start typing to search tools…
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '8px 14px',
                borderTop: '1px solid var(--tb-border)',
                backgroundColor: 'var(--tb-bg-deep)',
                fontFamily: 'var(--tb-font-mono)',
                fontSize: 10.5,
                color: 'var(--tb-text-faint)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="tb-kbd">↑</span>
                <span className="tb-kbd">↓</span> navigate
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="tb-kbd">↵</span> open
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="tb-kbd">esc</span> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
