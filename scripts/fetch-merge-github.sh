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

# Switch to main branch
echo -e "${GREEN}Switching to main branch...${NC}"
git checkout main

# Fetch latest from origin
echo -e "${GREEN}Fetching latest from origin...${NC}"
git fetch origin

# Merge origin/main
echo -e "${GREEN}Merging origin/main...${NC}"
if git merge origin/main; then
    echo -e "${GREEN}✅ Merge successful!${NC}"
else
    echo -e "${RED}❌ Merge conflicts detected!${NC}"
    echo -e "${YELLOW}Please resolve conflicts and commit${NC}"
    echo -e "${YELLOW}Files with conflicts:${NC}"
    git diff --name-only --diff-filter=U
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