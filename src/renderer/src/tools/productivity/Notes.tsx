import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Plus, Trash2, Save, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'toolbox-notes';

function getNotesFromStorage(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(getNotesFromStorage);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = useThemeColors();

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setHasUnsavedChanges(false);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNoteId, notes]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback(
    (updatedNotes: Note[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNotesToStorage(updatedNotes);
      }, 300);
    },
    []
  );

  const createNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now(),
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    saveNotesToStorage(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    if (selectedNoteId === id) {
      setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
    saveNotesToStorage(updatedNotes);
  };

  const updateNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNoteId) return;

    const updatedNotes = notes.map((note) => {
      if (note.id === selectedNoteId) {
        return {
          ...note,
          [field]: value,
          updatedAt: Date.now(),
        };
      }
      return note;
    });

    setNotes(updatedNotes);
    setHasUnsavedChanges(true);

    if (field === 'title') setTitle(value);
    else setContent(value);

    debouncedSave(updatedNotes);
  };

  const saveNow = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (selectedNoteId) {
      const updatedNotes = notes.map((note) => {
        if (note.id === selectedNoteId) {
          return {
            ...note,
            title,
            content,
            updatedAt: Date.now(),
          };
        }
        return note;
      });
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      setHasUnsavedChanges(false);
    }
  };

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const charCount = content.length;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: c.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0,
      color: c.text,
    },
    subtitle: {
      fontSize: '15px',
      color: c.textSecondary,
      margin: 0,
      marginTop: '4px',
    },
    contentArea: {
      display: 'flex',
      flex: 1,
      gap: '20px',
      overflow: 'hidden',
    },
    sidebar: {
      width: '300px',
      minWidth: '300px',
      borderRight: `1px solid ${c.border}`,
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px',
      borderBottom: `1px solid ${c.border}`,
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    newNoteBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      backgroundColor: c.accent,
      color: c.text,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.15s',
    },
    noteList: {
      flex: 1,
      overflowY: 'auto',
      padding: '10px',
    },
    noteItem: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '14px',
      marginBottom: '6px',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      border: '1px solid transparent',
    },
    noteItemActive: {
      backgroundColor: c.border,
      border: `1px solid ${c.accent}`,
    },
    noteItemInactive: {
      backgroundColor: 'transparent',
    },
    noteInfo: {
      flex: 1,
      minWidth: 0,
    },
    noteTitle: {
      fontSize: '15px',
      fontWeight: '500',
      color: c.text,
      marginBottom: '6px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    noteDate: {
      fontSize: '13px',
      color: c.textSecondary,
    },
    deleteBtn: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: c.textSecondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.15s, background-color 0.15s',
      flexShrink: 0,
    },
    editorArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    editorHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 28px',
      borderBottom: `1px solid ${c.border}`,
      gap: '20px',
    },
    titleInput: {
      flex: 1,
      fontSize: '22px',
      fontWeight: '600',
      color: c.text,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      padding: '0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    saveBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: hasUnsavedChanges ? c.accent : c.border,
      color: hasUnsavedChanges ? c.text : c.textSecondary,
      border: 'none',
      borderRadius: '8px',
      cursor: hasUnsavedChanges ? 'pointer' : 'default',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.15s, color 0.15s',
      flexShrink: 0,
    },
    textarea: {
      flex: 1,
      width: '100%',
      padding: '24px 28px',
      backgroundColor: 'transparent',
      color: c.text,
      border: 'none',
      outline: 'none',
      resize: 'none',
      fontSize: '15px',
      lineHeight: '1.8',
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '12px 28px',
      borderTop: `1px solid ${c.border}`,
      gap: '24px',
      fontSize: '13px',
      color: c.textSecondary,
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: c.textSecondary,
      gap: '16px',
    },
    emptyIcon: {
      opacity: 0.5,
    },
    noteCount: {
      fontSize: '13px',
      color: c.textSecondary,
      padding: '0 18px 10px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FileText size={28} color={c.accent} />
        <div>
          <h1 style={styles.title}>Notes</h1>
          <p style={styles.subtitle}>Capture your thoughts and ideas</p>
        </div>
      </div>

      <div style={styles.contentArea}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>
              <FileText size={20} />
              Notes
            </div>
            <button
              style={styles.newNoteBtn}
              onClick={createNote}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = c.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = c.accent;
              }}
            >
              <Plus size={18} />
              New
            </button>
          </div>
          <div style={styles.noteCount}>
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </div>
          <div style={styles.noteList}>
            {notes.length === 0 ? (
              <div style={{ ...styles.emptyState, padding: '48px 0' }}>
                <FileText size={36} style={styles.emptyIcon} />
                <span>No notes yet</span>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    ...styles.noteItem,
                    ...(note.id === selectedNoteId
                      ? styles.noteItemActive
                      : styles.noteItemInactive),
                  }}
                  onClick={() => setSelectedNoteId(note.id)}
                  onMouseEnter={(e) => {
                    if (note.id !== selectedNoteId) {
                      e.currentTarget.style.backgroundColor = c.border;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (note.id !== selectedNoteId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={styles.noteInfo}>
                    <div style={styles.noteTitle}>{note.title || 'Untitled Note'}</div>
                    <div style={styles.noteDate}>{formatDate(note.updatedAt)}</div>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = c.textSecondary;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Delete note"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.editorArea}>
          {selectedNote ? (
            <>
              <div style={styles.editorHeader}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateNote('title', e.target.value)}
                  placeholder="Note title..."
                  style={styles.titleInput}
                />
                <button
                  style={styles.saveBtn}
                  onClick={saveNow}
                  onMouseEnter={(e) => {
                    if (hasUnsavedChanges) {
                      e.currentTarget.style.backgroundColor = c.accentHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasUnsavedChanges) {
                      e.currentTarget.style.backgroundColor = c.accent;
                    }
                  }}
                  title={hasUnsavedChanges ? 'Save now' : 'All changes saved'}
                >
                  <Save size={18} />
                  {hasUnsavedChanges ? 'Save' : 'Saved'}
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => updateNote('content', e.target.value)}
                placeholder="Start writing..."
                style={styles.textarea}
              />
              <div style={styles.statusBar}>
                <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                <span>{charCount} character{charCount !== 1 ? 's' : ''}</span>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <FileText size={56} style={styles.emptyIcon} />
              <span style={{ fontSize: '18px' }}>Select a note or create a new one</span>
              <button
                style={styles.newNoteBtn}
                onClick={createNote}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = c.accentHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = c.accent;
                }}
              >
                <Plus size={18} />
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}