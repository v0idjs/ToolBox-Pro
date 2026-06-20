# Architecture Overview

This document describes the architecture and design of ToolBox Pro.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ToolBox Pro                            │
├─────────────────────────────────────────────────────────────┤
│                    Electron Shell                           │
├──────────────────┬──────────────────┬───────────────────────┤
│   Main Process   │  Preload Scripts │    Renderer Process   │
│   (Node.js)      │  (Bridge)        │    (React)            │
├──────────────────┼──────────────────┼───────────────────────┤
│ - Window Mgmt    │ - Context Bridge │ - UI Components       │
│ - File System    │ - IPC Proxy      │ - Tool Registry       │
│ - Native Dialogs │                  │ - State Management    │
│ - System APIs    │                  │ - Theme System        │
└──────────────────┴──────────────────┴───────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────┐
│  Main Process (Node.js)                        │
│  sandbox: true | contextIsolation: true         │
│  nodeIntegration: false                         │
│  isPathSafe() validates file paths              │
├─────────────────────────────────────────────────┤
│  Preload (contextBridge)                        │
│  Exposes only window.api methods                │
│  No direct Node.js access from renderer         │
├─────────────────────────────────────────────────┤
│  Renderer (React)                               │
│  Cannot require(), import fs, or access Node    │
│  All native ops go through window.api           │
└─────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── main/                          # Electron Main Process
│   └── index.ts                   # App entry, window creation, IPC handlers
│
├── preload/                       # Preload Scripts
│   ├── index.ts                   # Context bridge API exposure
│   └── index.d.ts                 # TypeScript definitions
│
└── renderer/                      # React Frontend
    ├── index.html                 # HTML entry point
    └── src/
        ├── App.tsx                # Root component, routing, tool registration
        ├── main.tsx               # React DOM mount
        │
        ├── assets/
        │   └── index.css          # Global styles
        │
        ├── components/
        │   ├── layout/
        │   │   ├── DashboardLayout.tsx
        │   │   ├── Sidebar.tsx     # 280px sidebar, 7 categories
        │   │   └── TopNavbar.tsx   # Search + theme toggle
        │   ├── SearchModal.tsx
        │   └── ui/               # Reusable UI components
        │
        ├── lib/
        │   ├── theme.ts          # useThemeColors() hook
        │   ├── tool-registry.ts  # Tool registration & discovery
        │   └── utils.ts          # Utility functions
        │
        ├── pages/
        │   ├── DashboardHome.tsx # Main dashboard view
        │   └── SettingsPage.tsx  # Application settings
        │
        ├── store/
        │   ├── app-store.ts      # Global app state (Zustand)
        │   └── settings-store.ts # User preferences (Zustand)
        │
        ├── tools/                 # 37 tools across 6 categories
        │   ├── security/         # 7 tools
        │   ├── developer/        # 11 tools
        │   ├── file/             # 7 tools
        │   ├── image/            # 5 tools
        │   ├── qr/               # 2 tools
        │   └── productivity/     # 5 tools
        │
        └── types/
            └── tool.ts           # TypeScript interfaces
```

## Core Concepts

### Tool Registry Pattern

Tools are self-registering modules that follow a consistent interface:

```typescript
interface ToolModule {
  id: string           // Unique identifier
  name: string         // Display name
  description: string  // Short description
  icon: string         // Lucide icon name
  category: string     // Tool category
  keywords: string[]   // Search keywords
  render: () => JSX.Element  // Tool UI component
}
```

Benefits:
- **Modularity**: Each tool is self-contained
- **Discoverability**: Tools can be found via search
- **Extensibility**: Easy to add new tools
- **Isolation**: Tool failures don't affect others (App-level ErrorBoundary)

### State Management

Zustand stores manage application state:

1. **AppStore** (`app-store.ts`)
   - Active tool selection
   - Search state
   - Favorites list
   - Recent tools (with 300ms debounce)

2. **SettingsStore** (`settings-store.ts`)
   - Theme preferences (dark/light/system)
   - Startup behavior
   - Accent color

### Theme System

The theme system supports:
- Dark mode (default)
- Light mode
- System preference detection
- Custom accent colors

Colors are managed through the `useThemeColors()` hook:
```typescript
const colors = useThemeColors()
// colors.bg, colors.card, colors.border, colors.text,
// colors.textSecondary, colors.accent, colors.input,
// colors.success, colors.warning, colors.error
```

### IPC Communication

Electron IPC handlers provide secure communication:

```
Renderer Process → Preload (window.api) → Main Process
                                              ↓
                                         Native APIs
                                              ↓
Main Process → Preload → Renderer Process
```

Available IPC channels:

| Channel | Description | Returns |
|---------|-------------|---------|
| `dialog:openFile` | Open single file dialog | `{ filePath, content, name, size }` |
| `dialog:openFiles` | Open multi-file dialog | `{ filePath, content, name }[]` |
| `dialog:openFolder` | Open folder picker | folder path string |
| `dialog:saveFile` | Save dialog + optional write | saved file path |
| `fs:getFolderSize` | Recursive directory scan | files + subdirs with sizes |
| `fs:listFiles` | List files in directory | `{ name, path, size }[]` |
| `fs:batchRename` | Batch rename files | `{ success, failed, errors }` |
| `fs:findDuplicates` | Find duplicate files by MD5 | `string[][]` |
| `fs:computeFileHash` | Compute file hash | `{ hash, size }` |

### Tool Rendering

App.tsx renders tools directly without a card wrapper:
```tsx
<div style={{ padding: '32px 40px' }}>
  <button onClick={() => setActiveTool('home')}>Back to Dashboard</button>
  <ErrorBoundary>
    {tool.render()}
  </ErrorBoundary>
</div>
```

Each tool manages its own header (icon + h1 + subtitle), form elements, and result sections.

## Tool Categories (37 total)

### Security (7)
- Password Generator, Password Strength Analyzer, Secret Scanner
- Hash Generator, Hash Checker, Base64 Encoder/Decoder, JWT Decoder

### Developer (11)
- JSON Formatter, XML Formatter, YAML Formatter, Regex Tester
- URL Encoder/Decoder, UUID Generator, Timestamp Converter, Color Converter
- JSON ↔ CSV Converter, Number Base Converter, CSS Unit Converter

### File (7)
- Remove Duplicate Lines, File Splitter, File Merger
- Batch File Rename, File Checksum Verifier
- Folder Size Analyzer, Duplicate File Finder

### Image (5)
- Image Converter, Image Compressor, Image Resizer
- Image Metadata Viewer, Color Picker

### QR & Barcode (2)
- QR Generator, Barcode Generator

### Productivity (5)
- Notes, To-Do Manager, Pomodoro Timer, Stopwatch, Countdown Timer

## Data Flow

```
User Action
    ↓
React Component (tool)
    ↓
Zustand Store (state update) or window.api call
    ↓
UI Re-render
    ↓
[If IPC] Main Process → Native API → Response → Renderer
```

## Performance Considerations

- **Eager Loading**: All tools loaded at startup (lazy loading planned)
- **Debounced Search**: Search input is debounced
- **Debounced Persistence**: TodoManager uses 300ms debounce on localStorage writes
- **requestAnimationFrame**: Stopwatch uses rAF for smooth 60fps updates
- **Error Boundaries**: App-level ErrorBoundary catches tool crashes

## Security Considerations

- **Context Isolation**: Renderer process is isolated from Node.js
- **Sandbox**: Renderer runs in sandboxed environment
- **Node Integration**: Disabled — no `require()` in renderer
- **Path Validation**: `isPathSafe()` blocks access to system directories
- **No External Requests**: All data processed locally
- **Secure Preload**: Only explicit `window.api` methods exposed
