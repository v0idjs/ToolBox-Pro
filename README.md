<div align="center">

# ToolBox Pro

**Universal Local Productivity Toolkit**

A modern desktop application containing 40 utility tools in a single application. Works completely offline with a premium dashboard UI.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-35.x-purple.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

</div>

---

## Features

### Security Tools (7)
- **Password Generator** - Generate secure passwords with customizable length, character types, and strength meter
- **Password Strength Analyzer** - Analyze entropy, detect patterns, and estimate crack time across 4 attack scenarios
- **Secret Scanner** - Detect 50+ types of leaked API keys, tokens, and credentials in code (AWS, GitHub, OpenAI, Stripe, etc.)
- **Hash Generator** - Create SHA-1, SHA-256, and SHA-512 hashes
- **Hash Checker** - Compare and verify hash values
- **Base64 Encoder/Decoder** - Encode and decode Base64 strings
- **JWT Decoder** - Inspect JSON Web Token payloads

### Developer Tools (13)
- **JSON Formatter** - Beautify, minify, and validate JSON
- **XML Formatter** - Format and validate XML documents
- **YAML Formatter** - Format and validate YAML files
- **Regex Tester** - Test regular expressions with match highlighting
- **URL Encoder/Decoder** - Encode and decode URLs
- **UUID Generator** - Generate UUID v4 identifiers
- **Timestamp Converter** - Convert between Unix timestamps and human-readable dates
- **Color Converter** - Convert between HEX, RGB, and HSL color formats
- **JSON ↔ CSV Converter** - Flatten nested JSON to CSV and parse CSV back to JSON with dot-notation keys
- **Number Base Converter** - Convert between binary, octal, decimal, hex, and custom bases in real time
- **CSS Unit Converter** - Convert px, rem, em, vw with configurable base font size and viewport width
- **Text Encoding Converter** - Convert text and files between UTF-8, UTF-16, Windows-1252, and ASCII with BOM handling
- **SQL Formatter** - Beautify and minify SQL queries with dialect-aware keyword casing (PostgreSQL, MySQL, T-SQL, PL/SQL, and more)

### File Tools (8)
- **Remove Duplicate Lines** - Deduplicate text content with file upload support
- **File Splitter** - Split large files into smaller parts (Windows line-ending aware)
- **File Merger** - Combine multiple files into one
- **Batch File Rename** - Rename multiple files with find/replace, regex, prefix/suffix, numbering, and case changes
- **File Checksum Verifier** - Verify file integrity with MD5, SHA-1, or SHA-256 via drag & drop
- **Folder Size Analyzer** - Analyze disk usage with recursive folder size calculation
- **Duplicate File Finder** - Find duplicate files by content hash
- **PDF Merger & Splitter** - Combine PDF files or extract page ranges and split into chunked parts

### Image Tools (5)
- **Image Converter** - Convert between PNG, JPG, WEBP, and BMP formats
- **Image Compressor** - Reduce image file sizes with adjustable quality
- **Image Resizer** - Resize images to custom dimensions
- **Image Metadata Viewer** - View EXIF and other image metadata
- **Color Picker** - Pick colors from images

### QR & Barcode Tools (2)
- **QR Generator** - Create QR codes for text, URLs, and WiFi configs (powered by `qrcode` library)
- **Barcode Generator** - Generate CODE128 barcodes

### Productivity Tools (5)
- **Notes** - Local note-taking with storage
- **To-Do Manager** - Task management with priorities
- **Pomodoro Timer** - Focus timer with work/break intervals
- **Stopwatch** - Precision timing with requestAnimationFrame
- **Countdown Timer** - Custom countdown with alerts

**Total: 40 tools across 6 categories**

## Screenshots

<div align="center">

![Dashboard](docs/images/dashboard.png)

![Password Generator](docs/images/password-generator.png)

![JSON Formatter](docs/images/json-formatter.png)

</div>

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Git](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/v0idjs/ToolBox-Pro.git
cd toolbox-pro
```

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Project Structure

```
toolbox-pro/
├── src/
│   ├── main/                    # Electron main process
│   │   └── index.ts            # Main process entry point, IPC handlers
│   ├── preload/                 # Electron preload scripts
│   │   ├── index.ts            # Context bridge API
│   │   └── index.d.ts          # Type definitions
│   └── renderer/                # React frontend
│       ├── index.html           # HTML entry point
│       └── src/
│           ├── App.tsx          # Root component
│           ├── main.tsx         # React entry point
│           ├── assets/          # CSS and static assets
│           ├── components/      # Shared UI components
│           │   ├── layout/      # Dashboard layout, sidebar, navbar
│           │   └── ui/          # Reusable UI primitives
│           ├── lib/             # Utilities, theme, tool registry
│           ├── pages/           # Dashboard and settings pages
│           ├── store/           # Zustand state management
│           ├── tools/           # Tool implementations
│           │   ├── security/    # Security tools (7)
│           │   ├── developer/   # Developer tools (11)
│           │   ├── file/        # File tools (7)
│           │   ├── image/       # Image tools (5)
│           │   ├── qr/          # QR & barcode tools (2)
│           │   └── productivity/# Productivity tools (5)
│           └── types/           # TypeScript type definitions
├── build/                       # Build resources (icons)
├── resources/                   # App resources
├── docs/                        # Documentation
├── package.json
├── tsconfig.json
├── electron.vite.config.ts
└── electron-builder.json5
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | [Electron 35](https://www.electronjs.org/) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Build Tool | [electron-vite](https://electron-vite.org/) |
| State Management | [Zustand](https://github.com/pmndrs/zustand) |
| Icons | [Lucide React](https://lucide.dev/) |
| QR Library | [qrcode](https://www.npmjs.com/package/qrcode) |
| Packaging | [electron-builder](https://www.electron.build/) |

## IPC API

ToolBox Pro exposes a secure `window.api` bridge for native operations:

| Method | Description |
|--------|-------------|
| `window.api.openFile()` | Open single file dialog → `{ filePath, content, name, size }` |
| `window.api.openFiles()` | Open multi-file dialog → `{ filePath, content, name }[]` |
| `window.api.openFolder()` | Open folder picker → folder path string |
| `window.api.saveFile(name, content)` | Save dialog, optionally writes content |
| `window.api.getFolderSize(dirPath)` | Recursively scan directory → files + subdirs with sizes |
| `window.api.listFiles(dirPath)` | List files in a directory |
| `window.api.batchRename(renames)` | Batch rename files → `{ success, failed, errors }` |
| `window.api.findDuplicates(dirPath)` | Find duplicate files by MD5 hash |
| `window.api.computeFileHash(path, algo)` | Compute file hash → `{ hash, size }` |

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run build:win` | Build for Windows |
| `npm run build:mac` | Build for macOS |
| `npm run build:linux` | Build for Linux |

### Adding a New Tool

1. Create a new component in `src/renderer/src/tools/<category>/`
2. Implement the `ToolModule` interface:

```typescript
import type { ToolModule } from '@/types/tool'

export const myTool: ToolModule = {
  id: 'my-tool',
  name: 'My Tool',
  description: 'Description of what the tool does',
  icon: 'IconName',
  category: 'developer',
  keywords: ['keyword1', 'keyword2'],
  render: () => <MyToolComponent />
}
```

3. Register the tool in the category's `index.tsx`
4. The tool will automatically appear in the sidebar and search

## Configuration

ToolBox Pro works out of the box with no configuration required. All data is stored locally on your machine.

### Theme Customization

- **Dark Mode** (default)
- **Light Mode**
- **System Theme** (follows OS preference)
- **Custom Accent Color** - Choose any accent color

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search modal |
| `Esc` | Close modal / Go back |

## Security

- **Context Isolation** enabled — renderer cannot access Node.js APIs directly
- **Sandbox** enabled — renderer runs in a sandboxed environment
- **Node Integration** disabled — no `require()` in renderer process
- **Path Validation** — file system access validated against blocked paths
- **Local-First** — all data processed locally, no external network requests

For reporting security vulnerabilities, see [SECURITY.md](SECURITY.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Microsoft PowerToys](https://github.com/microsoft/PowerToys), [DevToys](https://github.com/veler/devtoys), and [Raycast](https://raycast.com/)
- Built with Electron, React, and Zustand
