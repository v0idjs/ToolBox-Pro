import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Plus, Trash2, Check, Circle, CheckCircle2, ChevronUp, ChevronDown, ListTodo, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'toolbox-todos'

const loadTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveTodos = (todos: Todo[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function TodoManager() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const colors = useThemeColors()

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveTodos(todos)
    }, 300)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [todos])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now()
    }

    setTodos((prev) => [newTodo, ...prev])
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTodo()
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const moveTodo = (id: string, direction: 'up' | 'down') => {
    setTodos((prev) => {
      const index = prev.findIndex((todo) => todo.id === id)
      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev

      const updated = [...prev]
      const [removed] = updated.splice(index, 1)
      updated.splice(newIndex, 0, removed)
      return updated
    })
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const remaining = todos.filter((todo) => !todo.completed).length
  const hasCompleted = todos.some((todo) => todo.completed)

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <ListTodo size={28} color={colors.accent} />
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: colors.text }}>
            Todo Manager
          </h1>
          <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0, marginTop: '4px' }}>
            Keep track of your tasks and stay organized
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={addTodo}
          disabled={!input.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: colors.accent,
            color: colors.text,
            fontSize: '15px',
            fontWeight: 600,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            opacity: input.trim() ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          <Zap size={18} />
          Add
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: filter === f.key ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
              backgroundColor: filter === f.key ? colors.accent : colors.input,
              color: filter === f.key ? colors.text : colors.textSecondary,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTodos.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: '15px',
              borderRadius: '10px',
            }}
          >
            {filter === 'all'
              ? 'No todos yet. Add one above!'
              : filter === 'active'
                ? 'No active todos.'
                : 'No completed todos.'}
          </div>
        ) : (
          filteredTodos.map((todo, index) => {
            const originalIndex = todos.findIndex((t) => t.id === todo.id)
            return (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  transition: 'opacity 0.2s',
                  opacity: todo.completed ? 0.6 : 1
                }}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    padding: 0,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: todo.completed ? colors.accent : colors.textSecondary,
                    flexShrink: 0
                  }}
                >
                  {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <span
                  style={{
                    flex: 1,
                    fontSize: '15px',
                    color: colors.text,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    wordBreak: 'break-word'
                  }}
                >
                  {todo.text}
                </span>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => moveTodo(todo.id, 'up')}
                    disabled={originalIndex === 0}
                    title="Move up"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      backgroundColor: colors.bg,
                      color: colors.textSecondary,
                      cursor: originalIndex === 0 ? 'not-allowed' : 'pointer',
                      opacity: originalIndex === 0 ? 0.3 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveTodo(todo.id, 'down')}
                    disabled={originalIndex === todos.length - 1}
                    title="Move down"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      backgroundColor: colors.bg,
                      color: colors.textSecondary,
                      cursor: originalIndex === todos.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: originalIndex === todos.length - 1 ? 0.3 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: colors.textSecondary,
                    cursor: 'pointer',
                    transition: 'color 0.2s, background-color 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7F1D1D'
                    e.currentTarget.style.color = '#FCA5A5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = colors.textSecondary
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px'
        }}
      >
        <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
          {remaining} {remaining === 1 ? 'item' : 'items'} remaining
        </span>
        {hasCompleted && (
          <button
            onClick={clearCompleted}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.input,
              color: colors.textSecondary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FCA5A5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textSecondary
            }}
          >
            Clear Completed
          </button>
        )}
      </div>
    </div>
  )
}