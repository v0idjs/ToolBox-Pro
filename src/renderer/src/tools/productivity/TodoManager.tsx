import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Plus, Trash2, Circle, CheckCircle2, ChevronUp, ChevronDown, ListTodo, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

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
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: colors.text }}>
      <ToolHeader
        name="To-Do Manager"
        description="Manage tasks with a simple to-do list"
        category="productivity"
        icon={ListTodo}
        serial="todo-manager"
      />

      <Card>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            style={{ flex: 1 }}
          />
          <Button variant="primary" icon={Zap} onClick={addTodo} disabled={!input.trim()}>
            Add
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant="secondary"
              onClick={() => setFilter(f.key)}
              style={
                filter === f.key
                  ? { backgroundColor: colors.accentTint, borderColor: colors.accent, color: colors.accent }
                  : undefined
              }
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel hint={`${remaining} ${remaining === 1 ? 'item' : 'items'} remaining`}>Tasks</SectionLabel>
        {filteredTodos.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              fontFamily: 'var(--tb-font-mono)',
              fontSize: 12,
              letterSpacing: '0.04em',
              color: colors.textFaint
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
                  gap: 12,
                  padding: '11px 4px',
                  transition: 'opacity var(--tb-speed-fast) ease',
                  opacity: todo.completed ? 0.55 : 1,
                  ...(index > 0 ? { borderTop: `1px solid ${colors.border}` } : {})
                }}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  title={todo.completed ? 'Mark as active' : 'Mark as done'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    padding: 0,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: todo.completed ? colors.success : colors.textSecondary,
                    flexShrink: 0
                  }}
                >
                  {todo.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <span
                  style={{
                    flex: 1,
                    fontSize: 14.5,
                    color: colors.text,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    wordBreak: 'break-word'
                  }}
                >
                  {todo.text}
                </span>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ChevronUp}
                    onClick={() => moveTodo(todo.id, 'up')}
                    disabled={originalIndex === 0}
                    title="Move up"
                    style={{ padding: '5px 7px' }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ChevronDown}
                    onClick={() => moveTodo(todo.id, 'down')}
                    disabled={originalIndex === todos.length - 1}
                    title="Move down"
                    style={{ padding: '5px 7px' }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => deleteTodo(todo.id)}
                    title="Delete"
                    style={{ padding: '5px 7px', color: colors.error }}
                  />
                </div>
              </div>
            )
          })
        )}
        {hasCompleted && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button variant="ghost" size="sm" onClick={clearCompleted} style={{ color: colors.error }}>
              Clear Completed
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
