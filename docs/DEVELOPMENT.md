# Development Environment Setup

This document outlines the development tools and configurations for maintaining code quality in the TaskFlow project.

## 🛠️ Tools Overview

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Code linting and error detection | `.eslintrc.json` |
| **Prettier** | Code formatting | `.prettierrc.json` |
| **Husky** | Git hooks management | `.husky/` |
| **lint-staged** | Run linters on staged files | `.lintstagedrc.json` |
| **TypeScript** | Type checking | `tsconfig.json` |

## 📋 Available Scripts

### Linting
```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix
```

### Formatting
```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

### Type Checking
```bash
# Run TypeScript compiler checks
npm run type-check
```

### Validation
```bash
# Run all checks (type-check, lint, format)
npm run validate
```

## 🔧 Configuration Details

### ESLint Rules
- Extends Next.js recommended rules
- TypeScript support with strict type checking
- Prettier integration for consistent formatting
- Custom rules:
  - Warn on unused variables (except those prefixed with `_`)
  - Warn on `any` type usage
  - Enforce consistent type imports
  - Warn on missing exhaustive dependencies in hooks

### Prettier Settings
- No semicolons
- Single quotes
- Trailing commas
- 100 character line width
- 2 space indentation
- Auto line endings (works on Windows/Mac/Linux)

### Pre-commit Hooks
When you commit code, Husky automatically:
1. Runs ESLint on staged TypeScript/JavaScript files
2. Runs Prettier on all supported file types
3. Prevents commit if there are errors

## 🚀 Workflow

### Before Committing
1. **Run validation** to catch issues early:
   ```bash
   npm run validate
   ```

2. **Fix issues** if any are found:
   ```bash
   npm run lint:fix
   npm run format
   ```

### Committing Code
```bash
# Stage your changes
git add .

# Commit (pre-commit hooks will run automatically)
git commit -m "Your commit message"

# If commit fails due to linting errors, fix them and try again
npm run lint:fix
git add .
git commit -m "Your commit message"
```

### Using Git Flow Scripts
The project includes custom scripts that handle formatting automatically:
```bash
# This will format your code before committing
npm run push-github "Your feature description" feature
```

## 🎯 Best Practices

1. **IDE Integration**: Install ESLint and Prettier extensions in your IDE
   - VSCode: ESLint, Prettier - Code formatter
   - Enable "Format on Save" in your IDE settings

2. **Regular Validation**: Run `npm run validate` before pushing code

3. **Type Safety**: Avoid using `any` type; use proper TypeScript types

4. **Clean Imports**: Use type imports when importing only types:
   ```typescript
   import { type User } from '@/types'
   ```

5. **Consistent Formatting**: Let Prettier handle formatting; don't fight it

## 🐛 Troubleshooting

### ESLint Errors
```bash
# See all ESLint errors
npm run lint

# Auto-fix what's possible
npm run lint:fix
```

### Prettier Issues
```bash
# Check which files need formatting
npm run format:check

# Format all files
npm run format
```

### Pre-commit Hook Fails
```bash
# Bypass hooks (use sparingly!)
git commit --no-verify -m "Emergency fix"

# Better approach: fix the issues
npm run validate
npm run lint:fix
npm run format
```

### Type Errors
```bash
# Check TypeScript errors
npm run type-check

# Common fixes:
# - Add proper type annotations
# - Fix import statements
# - Update tsconfig.json if needed
```

## 📦 VS Code Settings (Recommended)

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 🔄 Keeping Tools Updated

Periodically update development dependencies:
```bash
# Check for updates
npm outdated

# Update all dev dependencies
npm update --save-dev

# Update specific tools
npm install --save-dev eslint@latest prettier@latest
```