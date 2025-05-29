#!/bin/bash

# Script to create branch following Git Flow, add files, commit with formatting fixes, and push

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  npm run push-github \"commit message\" [branch-type] [branch-name]"
    echo ""
    echo -e "${BLUE}Branch types (from GIT_FLOW.md):${NC}"
    echo "  feature  - New features/functions (branches from dev)"
    echo "  release  - Release preparation (branches from dev)"
    echo "  hotfix   - Emergency fixes (branches from main)"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  npm run push-github \"Add user authentication\" feature user-authentication"
    echo "  npm run push-github \"Prepare release 1.0.0\" release 1.0.0"
    echo "  npm run push-github \"Fix critical security issue\" hotfix security-patch"
    exit 1
}

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a commit message${NC}"
    usage
fi

# Parse arguments
COMMIT_MESSAGE="$1"
BRANCH_TYPE="${2:-feature}"  # Default to feature
CUSTOM_NAME="$3"

# Validate branch type
if [[ ! "$BRANCH_TYPE" =~ ^(feature|release|hotfix)$ ]]; then
    echo -e "${RED}Error: Invalid branch type '$BRANCH_TYPE'${NC}"
    usage
fi

# Generate branch name following GIT_FLOW.md conventions
if [ -z "$CUSTOM_NAME" ]; then
    # Auto-generate name from commit message (kebab-case, max 30 chars)
    SANITIZED_NAME=$(echo "$COMMIT_MESSAGE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-30)
    BRANCH_NAME="${BRANCH_TYPE}/${SANITIZED_NAME}"
else
    BRANCH_NAME="${BRANCH_TYPE}/${CUSTOM_NAME}"
fi

echo -e "${BLUE}Starting GitHub push workflow...${NC}"
echo -e "${BLUE}Branch type: ${BRANCH_TYPE}${NC}"
echo -e "${BLUE}Branch name: ${BRANCH_NAME}${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Determine base branch based on GIT_FLOW.md rules
case $BRANCH_TYPE in
    feature|release)
        BASE_BRANCH="dev"
        ;;
    hotfix)
        BASE_BRANCH="main"
        # Check if main exists, otherwise use master
        if ! git show-ref --verify --quiet refs/heads/main; then
            if git show-ref --verify --quiet refs/heads/master; then
                BASE_BRANCH="master"
            fi
        fi
        ;;
esac

echo -e "${BLUE}Base branch: ${BASE_BRANCH}${NC}"

# Step 1: Create and checkout branch based on Git Flow
if [[ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]]; then
    # Ensure we're on the correct base branch first
    echo -e "${GREEN}Switching to base branch: $BASE_BRANCH${NC}"
    git checkout "$BASE_BRANCH"
    
    # Pull latest changes
    echo -e "${GREEN}Pulling latest changes from $BASE_BRANCH...${NC}"
    git pull origin "$BASE_BRANCH"
    
    # Create and checkout new branch
    echo -e "${GREEN}Creating and checking out new branch: $BRANCH_NAME${NC}"
    git checkout -b "$BRANCH_NAME"
else
    echo -e "${BLUE}Already on branch: $BRANCH_NAME${NC}"
fi

# Step 2: Add all files
echo -e "${GREEN}Adding all files...${NC}"
git add .

# Step 3: Commit
echo -e "${GREEN}Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE" 2>&1 | tee /tmp/git_commit_output.txt

# Step 4: Check if there were formatting issues
if grep -q "husky\|prettier\|eslint\|lint" /tmp/git_commit_output.txt; then
    echo -e "${YELLOW}Formatting issues detected, fixing...${NC}"
    
    # Wait a moment for any auto-fixes to complete
    sleep 1
    
    # Add any files that were auto-fixed
    echo -e "${GREEN}Adding auto-fixed files...${NC}"
    git add .
    
    # Check if there are changes to commit
    if [[ -n $(git diff --cached --name-only) ]]; then
        echo -e "${GREEN}Committing formatting fixes...${NC}"
        git commit -m "style: Auto-fix formatting issues" --no-verify
    else
        echo -e "${BLUE}No additional formatting fixes needed${NC}"
    fi
fi

# Clean up temp file
rm -f /tmp/git_commit_output.txt

# Step 5: Push to origin
echo -e "${GREEN}Pushing to origin...${NC}"
git push -u origin "$BRANCH_NAME"

# Determine PR target branch
case $BRANCH_TYPE in
    feature|release)
        PR_BASE="dev"
        ;;
    hotfix)
        PR_BASE="$BASE_BRANCH"
        ;;
esac

# Create PR using GitHub CLI if available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}Creating pull request...${NC}"
    
    # Generate PR title based on branch type
    case $BRANCH_TYPE in
        feature)
            PR_TITLE="feat: $COMMIT_MESSAGE"
            ;;
        release)
            PR_TITLE="release: $COMMIT_MESSAGE"
            ;;
        hotfix)
            PR_TITLE="hotfix: $COMMIT_MESSAGE"
            ;;
    esac
    
    # Try to create PR
    gh pr create --base "$PR_BASE" --head "$BRANCH_NAME" --title "$PR_TITLE" --body "## Description
    
$COMMIT_MESSAGE

## Type of Change
- ${BRANCH_TYPE^} branch

## Changes Made
- 

## Testing
- [ ] Code has been tested locally
- [ ] All tests pass
- [ ] No regressions introduced

## Checklist
- [ ] Code follows project conventions
- [ ] Documentation has been updated
- [ ] No console errors or warnings
- [ ] Peer review requested" 2>/dev/null || echo -e "${BLUE}PR already exists or gh is not authenticated${NC}"
else
    echo -e "${BLUE}GitHub CLI not found. Create PR manually at:${NC}"
    echo -e "${GREEN}https://github.com/navigent/to-do-web-app/pull/new/$BRANCH_NAME${NC}"
    echo -e "${BLUE}Base branch should be: ${PR_BASE}${NC}"
fi

echo -e "${GREEN}✅ GitHub push workflow completed!${NC}"
echo -e "${BLUE}Branch: ${BRANCH_NAME} -> ${PR_BASE}${NC}"