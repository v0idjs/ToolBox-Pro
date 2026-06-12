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
        ├── App.tsx                # Root component, routing
        ├── main.tsx               # React DOM mount
        │
        ├── assets/
        │   └── index.css          # Global styles, Tailwind config
        │
        ├── components/
        │   ├── layout/
        │   │   ├── DashboardLayout.tsx
        │   │   ├── Sidebar.tsx
        │   │   └── TopNavbar.tsx
        │   ├── SearchModal.tsx
        │   └── ui/               # Reusable UI components
        │
        ├── lib/
        │   ├── theme.ts          # Theme system
        │   ├── tool-registry.ts  # Tool registration & discovery
        │   └── utils.ts          # Utility functions
        │
        ├── pages/
        │   ├── DashboardHome.tsx # Main dashboard view
        │   └── SettingsPage.tsx  # Application settings
        │
        ├── store/
        │   ├── app-store.ts      # Global app state
        │   └── settings-store.ts # User preferences
        │
        ├── tools/                 # Tool implementations
        │   ├── security/
        │   ├── developer/
        │   ├── file/
        │   ├── image/
        │   ├── qr/
        │   └── productivity/
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
- **Isolation**: Tool failures don't affect others

### State Management

Zustand stores manage application state:

1. **AppStore** (`app-store.ts`)
   - Active tool selection
   - Search state
   - Favorites list
   - Recent tools

2. **SettingsStore** (`settings-store.ts`)
   - Theme preferences
   - Startup behavior
   - Accent color

### Theme System

The theme system supports:
- Dark mode (default)
- Light mode
- System preference detection
- Custom accent colors

Colors are managed through:
- CSS custom properties (Tailwind)
- React hook (`useThemeColors()`)

### IPC Communication

Electron IPC handlers provide secure communication:

```
Renderer Process → Preload → Main Process
                              ↓
                         Native APIs
                              ↓
Main Process → Preload → Renderer Process
```

Available IPC channels:
- `dialog:openFile` - Open file dialog
- `dialog:openFiles` - Open multiple files
- `dialog:openFolder` - Open folder dialog
- `dialog:saveFile` - Save file dialog
- `fs:readFile` - Read file content
- `fs:writeFile` - Write file content
- `fs:getFolderSize` - Analyze folder size
- `fs:findDuplicates` - Find duplicate files

## Data Flow

```
User Action
    ↓
React Component
    ↓
Zustand Store (state update)
    ↓
UI Re-render
    ↓
[Optional] IPC Call
    ↓
Main Process (file system / native API)
    ↓
Response → Renderer
```

## Tool Categories

### Security Tools
- Password Generator
- Hash Generator/Checker
- Base64 Encoder/Decoder
- JWT Decoder

### Developer Tools
- JSON/XML/YAML Formatters
- Regex Tester
- URL Encoder/Decoder
- UUID Generator
- Timestamp Converter
- Color Converter

### File Tools
- Duplicate Line Remover
- File Splitter/Merger
- Folder Size Analyzer
- Duplicate File Finder

### Image Tools
- Image Converter/Compressor/Resizer
- Image Metadata Viewer
- Color Picker

### QR & Barcode Tools
- QR Generator
- Barcode Generator

### Productivity Tools
- Notes
- Todo Manager
- Timers (Pomodoro, Stopwatch, Countdown)

## Performance Considerations

- **Lazy Loading**: Tools are loaded on-demand
- **Virtual Lists**: Large lists use virtualization
- **Debounced Search**: Search input is debounced
- **Memoization**: React components are memoized where beneficial
- **Memory Management**: Large file operations stream data

## Security Considerations

- **Context Isolation**: Renderer process is isolated
- **Node Integration**: Disabled in renderer
- **Sandbox**: Enabled where possible
- **Input Validation**: All IPC inputs are validated
- **Local Storage**: No external network requests
