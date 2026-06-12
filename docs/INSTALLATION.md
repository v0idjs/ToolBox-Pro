# Installation Guide

## Prerequisites

Before installing ToolBox Pro, ensure you have the following:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Git](https://git-scm.com/)

## From Source

### 1. Clone the Repository

```bash
git clone https://github.com/v0idjs/ToolBox-Pro.git
cd toolbox-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development Mode

```bash
npm run dev
```

This will start the development server with hot-reload enabled.

## Building for Production

### Windows

```bash
npm run build:win
```

The installer will be created in the `dist/` directory.

### macOS

```bash
npm run build:mac
```

The DMG file will be created in the `dist/` directory.

### Linux

```bash
npm run build:linux
```

The AppImage will be created in the `dist/` directory.

## Pre-built Releases

Download the latest release from the [Releases page](https://github.com/v0idjs/toolbox-pro/releases).

### Windows
- Download the `.exe` installer
- Run the installer and follow the prompts

### macOS
- Download the `.dmg` file
- Open the DMG and drag ToolBox Pro to Applications

### Linux
- Download the `.AppImage` file
- Make it executable: `chmod +x ToolBox-*.AppImage`
- Run the AppImage

## Troubleshooting

### Node.js Version Issues

If you encounter issues with Node.js version:

```bash
# Check your Node.js version
node --version

# If you need to switch versions, use nvm:
nvm install 18
nvm use 18
```

### Build Failures

If the build fails:

1. Clean the project:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

### Electron Issues

If Electron fails to start:

1. Ensure all system dependencies are installed
2. On Linux, install required packages:
   ```bash
   sudo apt-get install -y libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth
   ```

## System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 200 MB for installation
- **Display**: 1024x768 minimum resolution
