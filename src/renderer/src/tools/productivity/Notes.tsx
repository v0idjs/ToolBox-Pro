import { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Plus, Trash2, Save } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, SectionLabel, Textarea } from '@/components/ui'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: number
}

const STORAGE_KEY = 'toolbox-notes'

function getNotesFromStorage(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveNotesToStorage(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(getNotesFromStorage)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const colors = useThemeColors()

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setHasUnsavedChanges(false)
    } else {
      setTitle('')
      setContent('')
    }
  }, [selectedNoteId, notes])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const debouncedSave = useCallback((updatedNotes: Note[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNotesToStorage(updatedNotes)
    }, 300)
  }, [])

  const createNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now()
    }
    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    setSelectedNoteId(newNote.id)
    saveNotesToStorage(updatedNotes)
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id)
    setNotes(updatedNotes)
    if (selectedNoteId === id) {
      setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null)
    }
    saveNotesToStorage(updatedNotes)
  }

  const updateNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNoteId) return

    const updatedNotes = notes.map((note) => {
      if (note.id === selectedNoteId) {
        return {
          ...note,
          [field]: value,
          updatedAt: Date.now()
        }
      }
      return note
    })

    setNotes(updatedNotes)
    setHasUnsavedChanges(true)

    if (field === 'title') setTitle(value)
    else setContent(value)

    debouncedSave(updatedNotes)
  }

  const saveNow = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    if (selectedNoteId) {
      const updatedNotes = notes.map((note) => {
        if (note.id === selectedNoteId) {
          return {
            ...note,
            title,
            content,
            updatedAt: Date.now()
          }
        }
        return note
      })
      setNotes(updatedNotes)
      saveNotesToStorage(updatedNotes)
      setHasUnsavedChanges(false)
    }
  }

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const charCount = content.length

  const metaText = {
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 11,
    letterSpacing: '0.04em',
    color: colors.textFaint
  } as React.CSSProperties

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: colors.text }}>
      <ToolHeader
        name="Notes"
        description="Simple note-taking with local storage"
        category="productivity"
        icon={FileText}
        serial="notes"
      />

      <div style={{ display: 'flex', flex: 1, gap: 16, overflow: 'hidden' }}>
        <div
          className="tb-panel"
          style={{ padding: 20, width: 300, minWidth: 300, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <SectionLabel hint={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}>Library</SectionLabel>
          <Button variant="primary" size="sm" icon={Plus} onClick={createNote} style={{ marginBottom: 12 }}>
            New
          </Button>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notes.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '48px 0',
                  color: colors.textSecondary
                }}
              >
                <FileText size={32} color={colors.textFaint} />
                <span style={metaText}>No notes yet</span>
              </div>
            ) : (
              notes.map((note, index) => (
                <div
                  key={note.id}
                  className="tb-hoverable"
                  onClick={() => setSelectedNoteId(note.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '11px 10px',
                    backgroundColor: note.id === selectedNoteId ? colors.accentTint : 'transparent',
                    ...(index > 0 ? { borderTop: `1px solid ${colors.border}` } : {})
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 500,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: colors.text
                      }}
                    >
                      {note.title || 'Untitled Note'}
                    </div>
                    <div style={metaText}>{formatDate(note.updatedAt)}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                    title="Delete note"
                    style={{
                      padding: 4,
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      color: colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="tb-panel" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedNote ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <input
                  type="text"
                  className="tb-field"
                  value={title}
                  onChange={(e) => updateNote('title', e.target.value)}
                  placeholder="Note title..."
                  style={{ flex: 1, fontSize: 17, fontWeight: 600 }}
                />
                <Button variant={hasUnsavedChanges ? 'primary' : 'secondary'} icon={Save} onClick={saveNow}>
                  {hasUnsavedChanges ? 'Save' : 'Saved'}
                </Button>
              </div>
              <Textarea
                mono
                value={content}
                onChange={(e) => updateNote('content', e.target.value)}
                placeholder="Start writing..."
                style={{ flex: 1, minHeight: 120 }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 20,
                  paddingTop: 12,
                  marginTop: 12,
                  borderTop: `1px solid ${colors.border}`,
                  ...metaText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em'
                }}
              >
                <span>
                  {wordCount} {wordCount !== 1 ? 'words' : 'word'}
                </span>
                <span>
                  {charCount} {charCount !== 1 ? 'characters' : 'character'}
                </span>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                color: colors.textSecondary
              }}
            >
              <FileText size={48} color={colors.textFaint} />
              <span style={{ fontSize: 15 }}>Select a note or create a new one</span>
              <Button variant="primary" icon={Plus} onClick={createNote}>
                Create Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
