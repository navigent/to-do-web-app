# Git Flow Branching Model

This project follows the Git Flow branching model for organized development and releases.

## Branch Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         main (production)                        │
├─────────────────────────────────────────────────────────────────┤
│                              ▲                ▲                  │
│                              │                │                  │
│                         release/1.0      hotfix/critical-bug     │
│                              ▲                ▲                  │
│                              │                │                  │
├─────────────────────────────────────────────────────────────────┤
│                           dev (staging)                          │
├─────────────────────────────────────────────────────────────────┤
│         ▲          ▲           ▲            ▲          ▲         │
│         │          │           │            │          │         │
│    feature/    feature/    feature/    feature/    feature/     │
│     auth      dashboard    api-crud     search      theme       │
└─────────────────────────────────────────────────────────────────┘
```

## Branch Types and Rules

### 🏠 Main Branch (`main`)
- **Purpose**: Production-ready code
- **Rules**: 
  - Protected branch
  - No direct commits
  - Only merge from `release` or `hotfix` branches
  - All code is tested and stable

### 🚧 Dev Branch (`dev`)
- **Purpose**: Integration branch for features
- **Rules**:
  - Protected branch
  - No direct commits (except small fixes)
  - Features are merged here first
  - Should always be deployable to staging

### ✨ Feature Branches (`feature/*`)
- **Purpose**: New features, functions, or major refactoring
- **Naming**: `feature/descriptive-name`
- **Flow**:
  ```
  dev → feature/xxx → dev
  ```
- **Examples**:
  - `feature/user-authentication`
  - `feature/task-filtering`
  - `feature/dark-mode`

### 📦 Release Branches (`release/*`)
- **Purpose**: Prepare new production release
- **Naming**: `release/version-number`
- **Flow**:
  ```
  dev → release/xxx → main + dev
  ```
- **Allowed changes**:
  - Bug fixes
  - Documentation updates
  - Version number updates
  - Configuration changes
- **Examples**:
  - `release/1.0.0`
  - `release/2.1.0`

### 🚨 Hotfix Branches (`hotfix/*`)
- **Purpose**: Emergency fixes for production
- **Naming**: `hotfix/descriptive-name`
- **Flow**:
  ```
  main → hotfix/xxx → main + dev
  ```
- **Rules**:
  - Minimal changes only
  - Must be merged to both `main` and `dev`
  - Increment patch version
- **Examples**:
  - `hotfix/security-patch`
  - `hotfix/critical-bug-fix`

## Workflow Examples

### Starting a New Feature
```bash
# 1. Make sure dev is up to date
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/new-awesome-feature

# 3. Work on feature...

# 4. Use our script to commit and push
npm run push-github "Add awesome feature" feature new-awesome-feature
```

### Creating a Release
```bash
# 1. Start from dev
git checkout dev
git pull origin dev

# 2. Create release branch
npm run push-github "Prepare release 1.0.0" release 1.0.0

# 3. Make final adjustments, bug fixes...

# 4. Merge to main and dev when ready
```

### Emergency Hotfix
```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create hotfix
npm run push-github "Fix critical security issue" hotfix security-patch

# 3. Apply minimal fix...

# 4. Merge to both main and dev
```

## Version Numbering

We follow Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── Hotfixes, bug fixes
  │     └──────── New features (from release branches)
  └────────────── Breaking changes
```

## Merge Strategy

- **Feature → Dev**: Squash and merge (clean history)
- **Release → Main**: Merge commit (preserve history)
- **Hotfix → Main**: Merge commit (preserve history)
- **Back-merges**: Regular merge (preserve history)

## Best Practices

1. **Keep branches small**: Features should be focused and mergeable within days, not weeks
2. **Regular updates**: Pull from dev frequently to avoid conflicts
3. **Clean commits**: Use meaningful commit messages following conventional commits
4. **Test before merge**: All tests must pass before merging
5. **Code review**: All PRs require at least one review
6. **Delete after merge**: Clean up feature branches after merging

## Quick Reference

| Action | Command |
|--------|---------|
| Start feature | `npm run push-github "description" feature` |
| Start release | `npm run push-github "Release X.Y.Z" release X.Y.Z` |
| Start hotfix | `npm run push-github "Fix issue" hotfix` |
| Update from main | `npm run fetch-merge-github` |

## Tools and Automation

This project includes custom scripts to automate Git Flow:

- `npm run push-github`: Automatically creates proper branch types
- `npm run fetch-merge-github`: Safely updates branches

See `/scripts/README.md` for detailed documentation.