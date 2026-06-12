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
├── preload/       # Bridge between main and renderer
└── renderer/      # React frontend
    └── src/
        ├── components/  # Shared UI components
        ├── tools/       # Tool implementations
        ├── store/       # State management
        ├── lib/         # Utilities
        └── pages/       # Page components
```

### Adding a New Tool

1. **Create the tool component**:

```tsx
// src/renderer/src/tools/<category>/MyTool.tsx
import { useState } from 'react'
import type { ToolModule } from '@/types/tool'

function MyToolComponent() {
  const [input, setInput] = useState('')
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter something..."
      />
      {/* Tool UI */}
    </div>
  )
}

export const myTool: ToolModule = {
  id: 'my-tool',
  name: 'My Tool',
  description: 'Does something useful',
  icon: 'Wrench',
  category: 'developer',
  keywords: ['tool', 'utility'],
  render: () => <MyToolComponent />
}
```

2. **Register the tool**:

```tsx
// src/renderer/src/tools/<category>/index.tsx
import { registerTools } from '@/lib/tool-registry'
import { myTool } from './MyTool'

export function registerMyTools() {
  registerTools([myTool])
}
```

3. **Import in App.tsx**:

```tsx
import { registerMyTools } from './tools/my-category'

registerMyTools()
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
  
  return (
    <div style={{ backgroundColor: colors.card, color: colors.text }}>
      Themed content
    </div>
  )
}
```

### File Operations

Use the preload API for file operations:

```tsx
const api = window.api

// Open a file
const file = await api.openFile()

// Save a file
await api.saveFile('output.txt', content)

// Read a file
const content = await api.readFile('/path/to/file')
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

- Use Tailwind CSS utilities
- Use the `cn()` helper for conditional classes
- Follow the existing color theme
- Keep inline styles minimal

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

In development mode, DevTools open automatically. You can also:

- Press `F12` to toggle DevTools
- Use `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)

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
4. Test your changes
5. Commit with conventional commits
6. Push and create a PR
7. Fill out the PR template
8. Wait for review

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.
