# Contributing to ToolBox Pro

Thank you for your interest in contributing to ToolBox Pro! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

Please be respectful and inclusive in all interactions. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [Git](https://git-scm.com/)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on the GitHub repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/toolbox-pro.git
   cd toolbox-pro
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/v0idjs/ToolBox-Pro.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

1. **Clear title** - Descriptive summary of the issue
2. **Steps to reproduce** - Exact steps to reproduce the behavior
3. **Expected behavior** - What you expected to happen
4. **Actual behavior** - What actually happened
5. **Environment** - OS, Node.js version, npm version

### Suggesting Features

Feature suggestions are welcome! Please provide:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other solutions you thought about
4. **Additional context** - Mockups, examples, etc.

### Contributing Code

1. **Find an issue** - Look for issues labeled `good first issue` or `help wanted`
2. **Discuss** - Comment on the issue to let others know you're working on it
3. **Implement** - Follow the coding standards below
4. **Test** - Ensure your changes work correctly
5. **Submit** - Create a pull request following the process below

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper type definitions
- Use interfaces for object shapes
- Export types that might be used by other modules

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names
- Add proper TypeScript types for props

Example:

```typescript
interface MyComponentProps {
  title: string
  onSubmit: (value: string) => void
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  // Implementation
}
```

### Styling

- Use Tailwind CSS utility classes
- Use the `cn()` utility for conditional classes
- Follow the existing color theme (dark mode primary)
- Keep inline styles minimal - prefer Tailwind

### File Organization

- One component per file
- Use descriptive file names
- Group related files in directories
- Keep tool implementations in their category folder

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PasswordGenerator.tsx` |
| Functions | camelCase | `generatePassword` |
| Constants | UPPER_SNAKE_CASE | `MAX_LENGTH` |
| Types | PascalCase | `ToolModule` |
| Files | PascalCase for components | `MyComponent.tsx` |
| Files | kebab-case for utilities | `tool-registry.ts` |

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring without functionality change |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Examples

```
feat(security): add password strength calculator
fix(json-formatter): handle malformed JSON gracefully
docs(readme): update installation instructions
refactor(tools): extract common tool utilities
```

## Pull Request Process

### Before Submitting

1. **Update your fork**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run type checking**

   ```bash
   npm run typecheck
   ```

3. **Test your changes**

   ```bash
   npm run dev
   ```

4. **Build the application**

   ```bash
   npm run build
   ```

### Submitting

1. **Push your changes**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a pull request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if applicable)

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

### PR Guidelines

- Keep PRs focused on a single change
- Write clear commit messages
- Add screenshots for UI changes
- Update documentation if needed
- Ensure the build passes

## Adding a New Tool

### 1. Create the Tool Component

```typescript
// src/renderer/src/tools/<category>/MyTool.tsx
import type { ToolModule } from '@/types/tool'

export function MyToolComponent() {
  return (
    <div>
      {/* Tool implementation */}
    </div>
  )
}

export const myTool: ToolModule = {
  id: 'my-tool',
  name: 'My Tool',
  description: 'What this tool does',
  icon: 'ToolIcon',
  category: 'developer',
  keywords: ['tool', 'keywords'],
  render: () => <MyToolComponent />
}
```

### 2. Register the Tool

```typescript
// src/renderer/src/tools/<category>/index.tsx
import { registerTools } from '@/lib/tool-registry'
import { myTool } from './MyTool'

export function registerMyTools() {
  registerTools([myTool])
}
```

### 3. Import in App.tsx

```typescript
import { registerMyTools } from './tools/my-category'

registerMyTools()
```

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue with the `question` label
2. Start a discussion in the Discussions tab
3. Reach out to maintainers

Thank you for contributing to ToolBox Pro!
