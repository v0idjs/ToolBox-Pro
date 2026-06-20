# Changelog

All notable changes to ToolBox Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Secret Scanner** — Detect 50+ types of leaked API keys, tokens, and credentials across 14 categories (Cloud, AI/ML, Source Control, Platform, Communication, CI/CD, Hosting, DevOps, Infrastructure, Database, Cryptography, Secrets Management, General, Informational)
- **Password Strength Analyzer** — Entropy calculation, pattern detection (keyboard walks, common words, sequential chars, repetitions), 4-scenario crack time estimates, improvement suggestions
- **Batch File Rename** — 5 rename modes: Find & Replace, Regex, Prefix/Suffix, Numbering, Case Change with live preview table
- **File Checksum Verifier** — Drag & drop file verification with MD5, SHA-1, SHA-256 support
- **JSON ↔ CSV Converter** — Bidirectional conversion with nested object flattening via dot-notation keys
- **Number Base Converter** — Real-time conversion between binary, octal, decimal, hex, and custom bases (2-36)
- **CSS Unit Converter** — px, rem, em, vw, % conversion with configurable base font size and viewport width, plus common breakpoints reference

### Changed
- Replaced custom QR encoder with `qrcode` npm library for reliable, scannable QR codes
- Rewrote `fs:getFolderSize` IPC handler to calculate actual recursive folder sizes (not just directory metadata)
- Removed insecure `readFile`/`writeFile` IPC handlers — all file access now goes through dialog-based APIs
- All 37 tools updated to consistent design language (icon + h1 + subtitle header, form elements with padding 14-16, borderRadius 10, result sections with Copy + metadata)
- Theme system overhauled: `useThemeColors()` hook used across all tools, SettingsPage fully converted from hardcoded colors
- Sidebar widened to 280px with larger fonts (15px items, 13px category headers)
- App.tsx no longer wraps tools in a card — tools render flush on the background with their own headers

### Fixed
- Security: Enabled `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`
- Security: Added path validation to block access to system directories
- Stopwatch timing: Replaced `setInterval` + `performance.now()` with `requestAnimationFrame` + `Date.now()` for accurate real-time tracking
- BarcodeGenerator: Fixed invisible barcode (background changed from dark to white)
- DuplicateFileFinder: Fixed broken `(g as any)._size` waste calculation
- YAMLFormatter: Fixed `beautify()` indent handling for list items
- ImageCompressor: Fixed memory leak and null crash
- ImageConverter: Fixed stale closure in URL revocation
- CountdownTimer: Fixed duplicate intervals by clearing old interval before setting new one
- PomodoroTimer: Fixed race condition with interval cleanup
- PasswordGenerator: Added empty pool guard to prevent infinite loop
- FileSplitter: Fixed Windows `\r\n` line endings handling
- QRGenerator: Added WiFi special character escaping, data overflow guard, password input masking
- FolderSizeAnalyzer: Fixed `sort()` mutation (now uses `[...entries].sort()`)
- ColorConverter: Hex input now strips non-hex chars and limits to 6 characters
- UUIDGenerator: Uppercase toggle now re-renders existing UUIDs
- HashGenerator: Algorithm selector is now functional
- TodoManager: Added 300ms debounce on localStorage writes
- Notes: Fixed stale state when switching between notes

## [1.0.0]

### Added

#### Core
- Electron + React + TypeScript application
- Dark premium dashboard UI with sidebar navigation
- Global search with Ctrl+K shortcut
- Favorites system
- Recent tools tracking
- Theme system (Dark/Light/System)
- Custom accent color support
- Error boundaries per tool view

#### Security Tools (5 → 7)
- Password Generator with strength meter
- Password Strength Analyzer (NEW)
- Secret Scanner with 50+ patterns (NEW)
- Hash Generator (SHA-1, SHA-256, SHA-512)
- Hash Checker for comparing hashes
- Base64 Encoder/Decoder
- JWT Decoder

#### Developer Tools (8 → 11)
- JSON Formatter (beautify, minify, validate)
- XML Formatter
- YAML Formatter
- Regex Tester with match highlighting
- URL Encoder/Decoder
- UUID Generator (v4)
- Timestamp Converter (Unix ↔ human-readable)
- Color Converter (HEX ↔ RGB ↔ HSL)
- JSON ↔ CSV Converter (NEW)
- Number Base Converter (NEW)
- CSS Unit Converter (NEW)

#### File Tools (5 → 7)
- Remove Duplicate Lines
- File Splitter
- File Merger
- Batch File Rename (NEW)
- File Checksum Verifier (NEW)
- Folder Size Analyzer
- Duplicate File Finder

#### Image Tools (5)
- Image Converter (PNG, JPG, WEBP, BMP)
- Image Compressor
- Image Resizer
- Image Metadata Viewer
- Color Picker

#### QR & Barcode Tools (2)
- QR Generator (text, URL, WiFi)
- Barcode Generator

#### Productivity Tools (5)
- Notes with local storage
- To-Do Manager
- Pomodoro Timer
- Stopwatch
- Countdown Timer

#### System
- Settings page (General, Appearance)
- Startup behavior configuration
- Theme toggle in TopNavbar
