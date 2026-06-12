# Configuration Guide

ToolBox Pro is designed to work out of the box with no configuration required. All settings are stored locally on your machine.

## Settings Access

Click the **Settings** icon in the top-right corner of the sidebar to access the Settings page.

## General Settings

### Startup Behavior

Control what happens when ToolBox Pro starts:

- **Dashboard** (default): Show the main dashboard
- **Last Tool**: Resume with the last used tool
- **Minimized**: Start minimized to system tray

### Recent Tools in Sidebar

Toggle to show or hide recently used tools in the sidebar.

## Appearance Settings

### Theme

Choose your preferred theme:

- **Dark** (default): Dark mode with blue accents
- **Light**: Light mode for daytime use
- **System**: Automatically match your OS theme

### Accent Color

Customize the accent color used throughout the application:

1. Go to Settings > Appearance
2. Click on the color picker
3. Select your preferred color
4. Changes apply immediately

Available preset colors:
- Blue (#2563EB) - Default
- Purple (#7C3AED)
- Green (#10B981)
- Red (#EF4444)
- Orange (#F97316)
- Teal (#14B8A6)
- Pink (#EC4899)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search modal |
| `Esc` | Close modal / Go back |
| `Ctrl+N` | New note (in Notes tool) |
| `Ctrl+S` | Save (context-dependent) |

## Data Storage

### Location

All data is stored locally:

- **Windows**: `%APPDATA%\ToolBox Pro\`
- **macOS**: `~/Library/Application Support/ToolBox Pro/`
- **Linux**: `~/.config/ToolBox Pro/`

### What's Stored

- Settings and preferences
- Favorites list
- Recent tools
- Notes content
- Todo items

### Backup

To backup your data, copy the storage directory to a safe location.

## Environment Variables

While not required, you can configure ToolBox Pro using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_DEBUG` | Enable debug logging | `false` |
| `APP_PORT` | Port for development server | `3000` |

### Setting Environment Variables

#### Windows

```cmd
set APP_DEBUG=true
npm run dev
```

#### macOS/Linux

```bash
APP_DEBUG=true npm run dev
```

#### .env File

Create a `.env` file in the project root:

```
APP_DEBUG=true
APP_PORT=3000
```

## Performance Tuning

### Memory Usage

ToolBox Pro typically uses 100-200MB of RAM. If you experience high memory usage:

1. Close unused tools
2. Restart the application periodically
3. Check for large files being processed

### Startup Time

Target startup time is under 3 seconds. If startup is slow:

1. Ensure no other Electron apps are running
2. Clear the application cache
3. Reinstall the application

## Advanced Configuration

### Electron Builder

The build configuration is in `electron-builder.json5`. Modify this file to customize the build process.

### Vite Configuration

The Vite configuration is in `electron.vite.config.ts`. Modify this file to customize the build toolchain.

### TypeScript

TypeScript configurations are in `tsconfig.json`, `tsconfig.node.json`, and `tsconfig.web.json`.

## Resetting Configuration

To reset all settings to defaults:

1. Close ToolBox Pro
2. Delete the configuration directory
3. Restart ToolBox Pro

**Warning**: This will delete all your settings, favorites, and stored data.
