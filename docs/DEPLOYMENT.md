# Deployment Guide

This guide covers building and deploying ToolBox Pro for production.

## Build Process

### Prerequisites

Ensure you have:
- Node.js v18+
- npm v9+
- All dependencies installed (`npm install`)

### Build Commands

| Platform | Command | Output |
|----------|---------|--------|
| All | `npm run build` | `out/` directory |
| Windows | `npm run build:win` | `dist/*.exe` |
| macOS | `npm run build:mac` | `dist/*.dmg` |
| Linux | `npm run build:linux` | `dist/*.AppImage` |

## Windows Deployment

### Building the Installer

```bash
npm run build:win
```

This creates:
- `dist/ToolBox Pro Setup.exe` - NSIS installer
- `dist/ToolBox Pro-*.nsis` - Uninstaller

### Installer Options

The NSIS installer supports:
- Custom installation directory
- Desktop shortcut creation
- Start menu shortcut creation
- Uninstaller

### Distribution

1. Upload the `.exe` installer to your distribution platform
2. Users run the installer directly
3. No additional runtime required

## macOS Deployment

### Building the DMG

```bash
npm run build:mac
```

This creates:
- `dist/ToolBox Pro.dmg` - Disk image

### Code Signing (Optional)

For distribution outside the App Store:

1. Get an Apple Developer certificate
2. Set up code signing in `electron-builder.json5`
3. Build with signing enabled

### Distribution

1. Upload the `.dmg` file
2. Users open the DMG and drag to Applications
3. First launch may require right-click > Open

## Linux Deployment

### Building the AppImage

```bash
npm run build:linux
```

This creates:
- `dist/ToolBox Pro-*.AppImage` - Portable app

### Distribution

1. Upload the `.AppImage` file
2. Users make it executable: `chmod +x ToolBox-*.AppImage`
3. Run the AppImage directly

## CI/CD Deployment

### GitHub Actions

The repository includes workflows for:

1. **CI** (`ci.yml`):
   - Runs on push to main/develop
   - Runs on pull requests
   - Type checks and builds

2. **Release** (`release.yml`):
   - Triggered by version tags (`v*`)
   - Builds for all platforms
   - Creates GitHub release with artifacts

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes:
   ```bash
   git commit -m "chore: release v1.0.1"
   ```
4. Create a tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
5. GitHub Actions will automatically build and create a release

## Auto-Updates (Future)

For automatic updates, consider:

1. **electron-updater**: Built-in updater for electron-builder
2. **S3/Cloud Storage**: Host update files
3. **GitHub Releases**: Use as update source

### Configuration

Add to `electron-builder.json5`:

```json5
{
  "publish": {
    "provider": "github",
    "owner": "toolbox-pro",
    "repo": "toolbox-pro"
  }
}
```

## Performance Optimization

### Build Optimization

- Enable source maps for debugging
- Use production mode for releases
- Optimize bundle size with tree-shaking

### Runtime Optimization

- Lazy load tools
- Use virtual lists for large datasets
- Minimize IPC calls
- Cache frequently accessed data

## Troubleshooting

### Build Fails

1. Clean and rebuild:
   ```bash
   rm -rf node_modules out dist
   npm install
   npm run build
   ```

2. Check for TypeScript errors:
   ```bash
   npm run typecheck
   ```

### Installer Issues

- Ensure no antivirus is blocking the build
- Check disk space
- Verify Node.js version

### Platform-Specific Issues

**Windows:**
- Ensure Windows SDK is installed (if building native modules)
- Check for code signing certificate issues

**macOS:**
- Install Xcode Command Line Tools
- Check Gatekeeper settings

**Linux:**
- Install required packages:
  ```bash
  sudo apt-get install -y libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth
  ```

## Distribution Checklist

- [ ] Test on target platform
- [ ] Verify all tools work
- [ ] Check file size is reasonable
- [ ] Include README in release
- [ ] Update CHANGELOG
- [ ] Tag the release
- [ ] Upload to distribution platform
- [ ] Announce release
