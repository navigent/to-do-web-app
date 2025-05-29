#!/bin/bash

# Script to fetch and merge from main branch

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting fetch and merge workflow...${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}📍 Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    echo -e "${YELLOW}Please commit or stash them before merging${NC}"
    read -p "Do you want to stash changes and continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Stashing changes...${NC}"
        git stash push -m "Auto-stash before merge from main"
        STASHED=true
    else
        echo -e "${RED}Merge cancelled${NC}"
        exit 1
    fi
fi

# Fetch latest from origin
echo -e "${GREEN}Fetching latest from origin...${NC}"
git fetch origin main

# Switch to main branch and pull latest
echo -e "${GREEN}Switching to main branch to ensure latest state...${NC}"
git checkout main
git pull origin main

# Show what will be merged
echo -e "${BLUE}Changes to be merged into ${YELLOW}$CURRENT_BRANCH${BLUE}:${NC}"
git log --oneline "$CURRENT_BRANCH"..main

# Check if there are any changes to merge
if [ -z "$(git log --oneline "$CURRENT_BRANCH"..main)" ]; then
    echo -e "${GREEN}✅ ${YELLOW}$CURRENT_BRANCH${GREEN} is already up to date with main!${NC}"
else
    # Merge main into feature branch
    echo -e "${GREEN}Merging ${YELLOW}main${GREEN} into ${YELLOW}$CURRENT_BRANCH${GREEN}...${NC}"
    git checkout "$CURRENT_BRANCH"
    if git merge main; then
        echo -e "${GREEN}✅ Merge successful!${NC}"
        
        # Push the merge
        read -p "Push merged changes to origin? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Pushing to origin...${NC}"
            git push origin "$CURRENT_BRANCH"
        fi
        
        # Switch back to main branch
        echo -e "${GREEN}Switching back to main branch...${NC}"
        git checkout main
    else
        echo -e "${RED}❌ Merge conflicts detected!${NC}"
        echo -e "${YELLOW}Please resolve conflicts and commit${NC}"
        echo -e "${YELLOW}Files with conflicts:${NC}"
        git diff --name-only --diff-filter=U
    fi
fi

# Pop stash if we stashed
if [ "$STASHED" = true ]; then
    echo -e "${GREEN}Restoring stashed changes...${NC}"
    git stash pop
fi

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Fetch and merge workflow completed!${NC}"
FINAL_BRANCH=$(git branch --show-current)
echo -e "${GREEN}📍 Now on branch: ${YELLOW}$FINAL_BRANCH${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"