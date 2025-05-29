# GitHub Workflow Scripts - Git Flow Model

This directory contains helper scripts that follow the Git Flow branching model.

## Git Flow Branching Strategy

```
main/master (production)
    │
    ├── hotfix/xxx ──────┐
    │                    │
    │                    ▼
develop ◄────────────────┤
    │                    │
    ├── feature/xxx ─────┤
    │                    │
    └── release/xxx ─────┘
```

### Branch Types

- **feature**: New features/functions/major refactorings
  - Branch from: `dev`
  - Merge to: `dev`
  - Naming: `feature/description`

- **release**: Release preparation and bug fixes
  - Branch from: `dev`
  - Merge to: `dev` and `main`
  - Naming: `release/version`

- **hotfix**: Emergency production fixes
  - Branch from: `main`
  - Merge to: `main` and `dev`
  - Naming: `hotfix/description`

## Available Scripts

### 🚀 push-github

Automates Git Flow branching, commits, and pull requests.

**Usage:**
```bash
npm run push-github "commit message" [branch-type] [branch-name]
```

**Parameters:**
- `commit message` (required): Your commit message
- `branch-type` (optional): `feature`, `release`, or `hotfix` (default: `feature`)
- `branch-name` (optional): Custom branch name (auto-generated if not provided)

**Examples:**
```bash
# Feature branch (default)
npm run push-github "Add user authentication"
# Creates: feature/add-user-authentication

# Feature with custom name
npm run push-github "Add OAuth support" feature oauth-integration
# Creates: feature/oauth-integration

# Release branch
npm run push-github "Prepare version 1.2.0" release v1.2.0
# Creates: release/v1.2.0

# Hotfix branch
npm run push-github "Fix critical security issue" hotfix
# Creates: hotfix/fix-critical-security-issue
```

**Workflow:**
1. Validates branch type
2. Switches to appropriate base branch (`dev` or `main`)
3. Pulls latest changes
4. Creates new branch following Git Flow conventions
5. Commits changes
6. Pushes to GitHub
7. Creates PR to correct target branch

### 🔄 fetch-merge-github

Safely fetches and merges the latest changes from main branch.

**Usage:**
```bash
npm run fetch-merge-github
```

**Features:**
- Shows current branch prominently
- Checks for uncommitted changes (offers to stash)
- Switches to main branch and pulls latest changes
- Shows preview of changes to merge
- Temporarily switches to feature branch for merge
- Handles merge conflicts gracefully
- Optional push after successful merge
- Returns to main branch after completion

## Git Flow Commands Reference

### Starting a Feature
```bash
npm run push-github "New feature description" feature
```

### Starting a Release
```bash
npm run push-github "Release 1.0.0" release v1.0.0
```

### Creating a Hotfix
```bash
npm run push-github "Fix production bug" hotfix
```

### Updating from Main
```bash
npm run fetch-merge-github
```

## Best Practices

1. **Features**: Always branch from latest `dev`
2. **Releases**: Only bug fixes and cleanup, no new features
3. **Hotfixes**: Minimal changes, must be merged to both `main` and `dev`
4. **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
5. **Pull Requests**: Always request peer review before merging

## Branch Protection Rules

Consider setting up these GitHub branch protection rules:

### For `main`:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators
- Restrict who can push

### For `dev`:
- Require pull request reviews
- Require status checks to pass
- Dismiss stale pull request approvals

## Requirements

- Git installed and configured
- Node.js for npm scripts
- GitHub repository access
- (Optional) GitHub CLI (`gh`) for automatic PR creation

## Installing GitHub CLI (Optional)

For automatic PR creation:

```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
# See: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate
gh auth login
```