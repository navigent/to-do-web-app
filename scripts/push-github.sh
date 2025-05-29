#!/bin/bash

# Script to add unstaged files, commit, create new branch following Git Flow, push, and create PR

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
    echo -e "${BLUE}Branch types:${NC}"
    echo "  feature  - New features/functions (branches from develop)"
    echo "  release  - Release preparation (branches from develop)"
    echo "  hotfix   - Emergency fixes (branches from main/master)"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  npm run push-github \"Add user authentication\" feature"
    echo "  npm run push-github \"Prepare v1.2.0\" release v1.2.0"
    echo "  npm run push-github \"Fix critical bug\" hotfix"
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

# Generate branch name if not provided
if [ -z "$CUSTOM_NAME" ]; then
    # Auto-generate name from commit message
    SANITIZED_NAME=$(echo "$COMMIT_MESSAGE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-50)
    BRANCH_NAME="${BRANCH_TYPE}/${SANITIZED_NAME}"
else
    BRANCH_NAME="${BRANCH_TYPE}/${CUSTOM_NAME}"
fi

echo -e "${BLUE}Starting GitHub push workflow...${NC}"
echo -e "${BLUE}Branch type: ${BRANCH_TYPE}${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Determine base branch based on type
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

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${GREEN}Adding all changes...${NC}"
    git add -A
    
    echo -e "${GREEN}Committing changes...${NC}"
    git commit -m "$COMMIT_MESSAGE"
else
    echo -e "${BLUE}No uncommitted changes found${NC}"
fi

# Create and switch to new branch if needed
if [[ "$CURRENT_BRANCH" == "$BRANCH_NAME" ]]; then
    echo -e "${BLUE}Already on branch: $BRANCH_NAME${NC}"
elif [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]] || [[ "$CURRENT_BRANCH" == "dev" ]]; then
    # Ensure we're on the correct base branch
    if [[ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]]; then
        echo -e "${GREEN}Switching to base branch: $BASE_BRANCH${NC}"
        git checkout "$BASE_BRANCH"
        
        # Pull latest changes
        echo -e "${GREEN}Pulling latest changes from $BASE_BRANCH...${NC}"
        git pull origin "$BASE_BRANCH"
    fi
    
    echo -e "${GREEN}Creating new branch: $BRANCH_NAME${NC}"
    git checkout -b "$BRANCH_NAME"
else
    # On a different feature branch
    echo -e "${YELLOW}Warning: Currently on branch '$CURRENT_BRANCH'${NC}"
    read -p "Create new branch '$BRANCH_NAME' from '$BASE_BRANCH'? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout "$BASE_BRANCH"
        git pull origin "$BASE_BRANCH"
        git checkout -b "$BRANCH_NAME"
    else
        BRANCH_NAME="$CURRENT_BRANCH"
        echo -e "${BLUE}Continuing with current branch: $BRANCH_NAME${NC}"
    fi
fi

# Push to origin
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