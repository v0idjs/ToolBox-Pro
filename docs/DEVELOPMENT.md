# Development Guide

This guide covers the development workflow for ToolBox Pro.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

## Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/your-username/toolbox-pro.git
cd toolbox-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
npm run dev
```

This starts the app with hot-reload. Changes to source files will automatically reload the app.

## Development Workflow

### Project Structure

```
src/
├── main/          # Electron main process (Node.js)
│   └── index.ts   # IPC handlers, window creation
├── preload/       # Bridge between main and renderer
│   ├── index.ts   # window.api methods
│   └── index.d.ts # Type definitions
└── renderer/      # React frontend
    └── src/
        ├── App.tsx              # Root component, tool registration
        ├── components/layout/   # Sidebar, TopNavbar, DashboardLayout
        ├── lib/                 # theme.ts, tool-registry.ts, utils.ts
        ├── pages/               # DashboardHome, SettingsPage
        ├── store/               # Zustand stores (app-store, settings-store)
        ├── tools/               # 37 tools across 6 categories
        │   ├── security/        # 7 tools
        │   ├── developer/       # 11 tools
        │   ├── file/            # 7 tools
        │   ├── image/           # 5 tools
        │   ├── qr/              # 2 tools
        │   └── productivity/    # 5 tools
        └── types/tool.ts        # ToolModule interface
```

### Adding a New Tool

1. **Create the tool component**:

```tsx
// src/renderer/src/tools/<category>/MyTool.tsx
import { useState, useCallback } from 'react'
import { Wrench, Copy, Check } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

export function MyToolComponent() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const colors = useThemeColors()

  const handleConvert = useCallback(() => {
    // Process input
    setOutput(result)
  }, [input])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }, [output])

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Wrench size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Tool</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
          Description of what this tool does
        </p>
      </div>
      {/* Tool body */}
    </div>
  )
}
```

2. **Register the tool** in the category's `index.tsx`:

```tsx
// src/renderer/src/tools/<category>/index.tsx
import { registerTools } from '@/lib/tool-registry'
import { MyToolComponent } from './MyTool'

export function registerMyTools() {
  registerTools([
    {
      id: 'my-tool',
      name: 'My Tool',
      description: 'What this tool does',
      icon: 'Wrench',
      category: 'developer',
      keywords: ['tool', 'utility'],
      render: () => <MyToolComponent />
    }
  ])
}
```

3. **Import in App.tsx** (if new category):

```tsx
import { registerMyTools } from './tools/my-category'
registerMyTools()
```

### Design Conventions

All tools follow this consistent layout:

```tsx
<div style={{ color: colors.text }}>
  {/* Header: icon + h1 + subtitle */}
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <Icon size={28} color={colors.accent} />
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Tool Name</h1>
    </div>
    <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0 }}>
      Description
    </p>
  </div>

  {/* Form elements use: padding 14-16, borderRadius 10, colors.input background */}
  {/* Primary buttons: 14px 28px, borderRadius 10, colors.accent background */}
  {/* Result sections: Copy button + metadata rows */}
</div>
```

### Working with State

Use Zustand stores for state management:

```tsx
import { useAppStore } from '@/store/app-store'

function MyComponent() {
  const { favorites, toggleFavorite } = useAppStore()

  return (
    <button onClick={() => toggleFavorite('tool-id')}>
      {favorites.includes('tool-id') ? 'Unfavorite' : 'Favorite'}
    </button>
  )
}
```

### Using the Theme

Access theme colors via the hook:

```tsx
import { useThemeColors } from '@/lib/theme'

function MyComponent() {
  const colors = useThemeColors()
  // colors.bg, colors.card, colors.border, colors.text,
  // colors.textSecondary, colors.accent, colors.input,
  // colors.success, colors.warning, colors.error

  return (
    <div style={{ backgroundColor: colors.card, color: colors.text }}>
      Themed content
    </div>
  )
}
```

### File Operations

Use the preload API for file operations (all go through native dialogs):

```tsx
const api = window.api

// Open a single file (shows native dialog)
const file = await api.openFile()
// Returns: { filePath, content, name, size } or null

// Open multiple files
const files = await api.openFiles()
// Returns: { filePath, content, name }[]

// Open a folder
const folder = await api.openFolder()
// Returns: folder path string or null

// Save a file (shows save dialog)
const savedPath = await api.saveFile('output.txt', content)
// Returns: saved file path or null

// List files in a directory
const files = await api.listFiles('/path/to/dir')
// Returns: { name, path, size }[]

// Batch rename files
const result = await api.batchRename([{ from: 'old.txt', to: 'new.txt' }])
// Returns: { success, failed, errors }

// Find duplicate files
const duplicates = await api.findDuplicates('/path/to/dir')
// Returns: string[][] (groups of duplicate file paths)

// Compute file hash
const { hash, size } = await api.computeFileHash('/path/to/file', 'sha256')
// Returns: { hash: string, size: number }
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build the application |
| `npm run typecheck` | Run TypeScript checks |
| `npm run build:win` | Build for Windows |
| `npm run build:mac` | Build for macOS |
| `npm run build:linux` | Build for Linux |
| `npm run preview` | Preview production build |

## Code Style

### TypeScript

- Use TypeScript for all code
- Avoid `any` types
- Use interfaces for object shapes
- Export types for reuse

### React

- Functional components only
- Use hooks for state and effects
- Keep components small and focused
- Use meaningful prop names

### Styling

- Use inline styles with `useThemeColors()` for all colors
- Avoid hardcoded color values (use `colors.accent`, `colors.text`, etc.)
- Follow the design conventions (fontSize 28/700 for titles, 15 for subtitles, etc.)

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MyComponent.tsx` |
| Functions | camelCase | `myFunction` |
| Constants | UPPER_SNAKE | `MAX_VALUE` |
| Files (components) | PascalCase | `MyComponent.tsx` |
| Files (utils) | kebab-case | `my-util.ts` |

## Testing

### Manual Testing

1. Start the dev server: `npm run dev`
2. Test the tool you're working on
3. Test related tools for regressions
4. Test on different screen sizes

### Type Checking

```bash
npm run typecheck
```

Fix all type errors before submitting a PR.

### Build Verification

```bash
npm run build
```

Ensure the build completes without errors.

## Debugging

### Electron DevTools

In development mode, press `F12` to toggle DevTools.

### Main Process Debugging

Add `--inspect` flag to debug the main process:

```bash
electron --inspect=5858 ./out/main/index.js
```

Then connect with Chrome DevTools at `chrome://inspect`.

### Common Issues

**Hot reload not working:**
- Restart the dev server
- Check for syntax errors in console

**Build fails:**
- Run `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run typecheck`

**App won't start:**
- Check console for errors
- Ensure all dependencies are installed

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run type checks: `npm run typecheck`
4. Build: `npm run build`
5. Test your changes
6. Commit with conventional commits
7. Push and create a PR
8. Fill out the PR template
9. Wait for review

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.
