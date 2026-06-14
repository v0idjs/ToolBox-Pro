// Test fixtures for ToolBox Pro E2E tests

export const testInputs = {
  // Security tools
  password: {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  },
  hash: {
    input: 'Hello, World!',
    sha256: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
  },
  base64: {
    input: 'Hello, World!',
    encoded: 'SGVsbG8sIFdvcmxkIQ==',
  },
  jwt: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },

  // Developer tools
  json: {
    input: '{"name":"ToolBox Pro","version":"1.0.0"}',
    formatted: '{\n  "name": "ToolBox Pro",\n  "version": "1.0.0"\n}',
  },
  xml: {
    input: '<root><name>ToolBox Pro</name></root>',
    formatted: '<root>\n  <name>ToolBox Pro</name>\n</root>',
  },
  yaml: {
    input: 'name: ToolBox Pro\nversion: 1.0.0',
    formatted: 'name: ToolBox Pro\nversion: 1.0.0',
  },
  url: {
    input: 'https://example.com/path?query=value&foo=bar',
    encoded: 'https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue%26foo%3Dbar',
  },

  // File tools
  duplicates: {
    input: 'line1\nline2\nline3\nline2\nline4\nline3',
    expected: 'line1\nline2\nline3\nline4',
  },

  // Productivity tools
  notes: {
    title: 'Test Note',
    content: 'This is a test note content.',
  },
  todo: {
    item: 'Test Todo Item',
  },
};

export const expectedResults = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  timestamp: /^\d{10,}$/,
  hash: {
    sha1: /^[a-f0-9]{40}$/i,
    sha256: /^[a-f0-9]{64}$/i,
    sha512: /^[a-f0-9]{128}$/i,
  },
};

export const selectors = {
  appReady: '[data-testid="app-ready"]',
  searchModal: '[data-testid="search-modal"]',
  searchInput: '[data-testid="search-input"]',
  searchResult: '[data-testid="search-result"]',
  sidebar: '[data-testid="sidebar"]',
  sidebarCategory: (category: string) => `[data-testid="sidebar-category-${category}"]`,
  sidebarTool: (toolId: string) => `[data-testid="sidebar-tool-${toolId}"]`,
  toolContent: '[data-testid="tool-content"]',
  settingsPage: '[data-testid="settings-page"]',
  themeToggle: '[data-testid="theme-toggle"]',
};
