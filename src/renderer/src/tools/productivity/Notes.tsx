import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Plus, Trash2, Save } from 'lucide-react';
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
      height: '100%',
      color: c.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
    },
    sidebar: {
      width: '300px',
      minWidth: '300px',
      borderRight: `1px solid ${c.border}`,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: c.card,
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      borderBottom: `1px solid ${c.border}`,
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    newNoteBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      backgroundColor: c.accent,
      color: c.text,
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'background-color 0.15s',
    },
    noteList: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px',
    },
    noteItem: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '12px',
      marginBottom: '4px',
      borderRadius: '8px',
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
      fontSize: '14px',
      fontWeight: '500',
      color: c.text,
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    noteDate: {
      fontSize: '12px',
      color: c.textSecondary,
    },
    deleteBtn: {
      padding: '6px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '4px',
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
      padding: '16px 24px',
      borderBottom: `1px solid ${c.border}`,
      gap: '16px',
    },
    titleInput: {
      flex: 1,
      fontSize: '20px',
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
      gap: '6px',
      padding: '8px 14px',
      backgroundColor: hasUnsavedChanges ? c.accent : c.border,
      color: hasUnsavedChanges ? c.text : c.textSecondary,
      border: 'none',
      borderRadius: '6px',
      cursor: hasUnsavedChanges ? 'pointer' : 'default',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'background-color 0.15s, color 0.15s',
      flexShrink: 0,
    },
    textarea: {
      flex: 1,
      width: '100%',
      padding: '20px 24px',
      backgroundColor: 'transparent',
      color: c.text,
      border: 'none',
      outline: 'none',
      resize: 'none',
      fontSize: '14px',
      lineHeight: '1.7',
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '10px 24px',
      borderTop: `1px solid ${c.border}`,
      gap: '20px',
      fontSize: '12px',
      color: c.textSecondary,
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: c.textSecondary,
      gap: '12px',
    },
    emptyIcon: {
      opacity: 0.5,
    },
    noteCount: {
      fontSize: '12px',
      color: c.textSecondary,
      padding: '0 16px 8px',
    },
  };

  return (
    <div style={styles.container}>
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
            <Plus size={16} />
            New
          </button>
        </div>
        <div style={styles.noteCount}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </div>
        <div style={styles.noteList}>
          {notes.length === 0 ? (
            <div style={{ ...styles.emptyState, padding: '40px 0' }}>
              <FileText size={32} style={styles.emptyIcon} />
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
                  <Trash2 size={16} />
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
                <Save size={16} />
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
            <FileText size={48} style={styles.emptyIcon} />
            <span style={{ fontSize: '16px' }}>Select a note or create a new one</span>
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
              <Plus size={16} />
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
