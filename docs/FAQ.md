# Frequently Asked Questions

## General

### What is ToolBox Pro?

ToolBox Pro is a desktop application that combines 37 utility tools in one place. It's designed for developers, power users, and anyone who needs quick access to common tools like password generators, formatters, converters, and more.

### Is ToolBox Pro free?

Yes, ToolBox Pro is free and open-source under the MIT License.

### What platforms are supported?

ToolBox Pro currently supports:
- Windows 10+
- macOS 10.15+
- Linux (Ubuntu 18.04+)

### Does ToolBox Pro require internet?

No, ToolBox Pro works completely offline. All tools process data locally on your machine.

### How many tools are included?

37 tools across 6 categories:
- **Security** (7): Password Generator, Password Strength Analyzer, Secret Scanner, Hash Generator, Hash Checker, Base64, JWT Decoder
- **Developer** (11): JSON/XML/YAML Formatters, Regex Tester, URL Encoder, UUID Generator, Timestamp Converter, Color Converter, JSON↔CSV, Number Base, CSS Unit
- **File** (7): Remove Duplicates, File Splitter, File Merger, Batch Rename, Checksum Verifier, Folder Size, Duplicate Finder
- **Image** (5): Image Converter, Compressor, Resizer, Metadata Viewer, Color Picker
- **QR & Barcode** (2): QR Generator, Barcode Generator
- **Productivity** (5): Notes, To-Do Manager, Pomodoro Timer, Stopwatch, Countdown Timer

## Installation

### How do I install ToolBox Pro?

**From source:**
```bash
git clone https://github.com/v0idjs/ToolBox-Pro.git
cd toolbox-pro
npm install
npm run dev
```

**From release:**
Download the installer for your platform from the [Releases page](https://github.com/v0idjs/toolbox-pro/releases).

### Why won't the app start?

Common solutions:
1. Ensure Node.js v18+ is installed
2. Run `npm install` to install dependencies
3. Try `npm run dev` to start in development mode
4. Check the console for error messages

## Tools

### How do I use a tool?

1. Click on a tool in the sidebar
2. Enter your input
3. The tool processes your data instantly
4. Copy or save the output

### Can I add my own tools?

Yes! See the [Development Guide](DEVELOPMENT.md) for instructions on creating custom tools.

### Where are my settings stored?

Settings are stored locally:
- **Windows**: `%APPDATA%\ToolBox Pro\`
- **macOS**: `~/Library/Application Support/ToolBox Pro/`
- **Linux**: `~/.config/ToolBox Pro/`

### Are my passwords secure?

ToolBox Pro processes all data locally. No passwords or sensitive data are sent anywhere. The app runs with sandbox enabled and node integration disabled for maximum security.

### What's the Secret Scanner?

The Secret Scanner detects 50+ types of leaked API keys, tokens, and credentials in code. It covers AWS, GitHub, OpenAI, Stripe, Slack, and many more services across 14 categories with severity classification (HIGH/MEDIUM/LOW).

## Development

### How do I contribute?

See the [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

### What tech stack is used?

- **Electron 35** - Desktop framework
- **React 19** - UI library
- **TypeScript 5** - Language
- **Zustand** - State management
- **electron-vite** - Build tool
- **Lucide React** - Icons
- **qrcode** - QR code generation

### How do I add a new tool?

1. Create a component in `src/renderer/src/tools/<category>/`
2. Implement the `ToolModule` interface
3. Register the tool in the category's `index.tsx`
4. Import in `App.tsx`

See the [Development Guide](DEVELOPMENT.md) for detailed instructions.

### How do I run tests?

Currently, ToolBox Pro uses manual testing. Run the app and test your changes:

```bash
npm run dev
```

Run type checking:
```bash
npm run typecheck
```

## Troubleshooting

### The app is slow

Try:
1. Restart the application
2. Close unused tools
3. Check system resources
4. Reinstall the application

### A tool isn't working

1. Try restarting the app
2. Check if the input is valid
3. Report the issue on [GitHub Issues](https://github.com/v0idjs/toolbox-pro/issues)

### Build fails

1. Clean and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Check TypeScript:
   ```bash
   npm run typecheck
   ```

3. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

## Getting Help

- Check the [Documentation](README.md)
- Search [GitHub Issues](https://github.com/v0idjs/toolbox-pro/issues)
- Start a [Discussion](https://github.com/v0idjs/toolbox-pro/discussions)
