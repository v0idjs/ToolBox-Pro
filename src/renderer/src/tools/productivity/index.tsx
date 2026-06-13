import { registerTools } from '@/lib/tool-registry'
import { Notes } from '@/tools/productivity/Notes'
import { TodoManager } from '@/tools/productivity/TodoManager'
import { PomodoroTimer } from '@/tools/productivity/PomodoroTimer'
import { Stopwatch } from '@/tools/productivity/Stopwatch'
import { CountdownTimer } from '@/tools/productivity/CountdownTimer'

export function registerProductivityTools() {
  registerTools([
    {
      id: 'notes',
      name: 'Notes',
      description: 'Simple note-taking with local storage',
      icon: 'FileText',
      category: 'productivity',
      keywords: ['notes', 'text', 'editor', 'write', 'local'],
      render: () => <Notes />
    },
    {
      id: 'todo-manager',
      name: 'To-Do Manager',
      description: 'Manage tasks with a simple to-do list',
      icon: 'CheckSquare',
      category: 'productivity',
      keywords: ['todo', 'task', 'list', 'check', 'manager'],
      render: () => <TodoManager />
    },
    {
      id: 'pomodoro-timer',
      name: 'Pomodoro Timer',
      description: 'Focus timer with work/break cycles',
      icon: 'Timer',
      category: 'productivity',
      keywords: ['pomodoro', 'timer', 'focus', 'work', 'break'],
      render: () => <PomodoroTimer />
    },
    {
      id: 'stopwatch',
      name: 'Stopwatch',
      description: 'Precision stopwatch with lap tracking',
      icon: 'Clock',
      category: 'productivity',
      keywords: ['stopwatch', 'timer', 'lap', 'precision', 'time'],
      render: () => <Stopwatch />
    },
    {
      id: 'countdown-timer',
      name: 'Countdown Timer',
      description: 'Countdown timer with presets and alerts',
      icon: 'Timer',
      category: 'productivity',
      keywords: ['countdown', 'timer', 'alarm', 'preset', 'time'],
      render: () => <CountdownTimer />
    }
  ])
}
