#!/bin/bash

# Release script for Todo App
# Usage: ./scripts/release.sh <major|minor|patch>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version type is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Version type is required${NC}"
  echo "Usage: $0 <major|minor|patch>"
  exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo -e "${RED}Error: Invalid version type. Use major, minor, or patch${NC}"
  exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}Warning: Working directory is not clean${NC}"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

# Calculate new version
IFS='.' read -r -a version_parts <<< "$CURRENT_VERSION"
major="${version_parts[0]}"
minor="${version_parts[1]}"
patch="${version_parts[2]}"

case $VERSION_TYPE in
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
esac

NEW_VERSION="${major}.${minor}.${patch}"
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Update version in sub-packages
cd apps/client && npm version $NEW_VERSION --no-git-tag-version && cd ../..
cd apps/server && npm version $NEW_VERSION --no-git-tag-version && cd ../..
cd packages/validation && npm version $NEW_VERSION --no-git-tag-version && cd ../..

echo -e "${GREEN}✓ Updated version in all packages${NC}"

# Commit changes
git add .
git commit -m "chore: release v${NEW_VERSION}"
echo -e "${GREEN}✓ Committed version bump${NC}"

# Create git tag
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
echo -e "${GREEN}✓ Created tag v${NEW_VERSION}${NC}"

echo ""
echo -e "${GREEN}Release ${NEW_VERSION} prepared successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git show"
echo "  2. Push changes: git push origin main"
echo "  3. Push tag: git push origin v${NEW_VERSION}"
echo ""
echo "Or push everything at once:"
echo "  git push origin main --tags"

