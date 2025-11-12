#!/bin/bash

# Setup Git hooks for development best practices

set -e

HOOKS_DIR=".git/hooks"

echo "🔧 Setting up Git hooks..."

# Pre-commit hook
cat > "${HOOKS_DIR}/pre-commit" << 'EOF'
#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Run linter
echo "  → Linting..."
pnpm lint || {
  echo "❌ Linting failed. Please fix errors before committing."
  exit 1
}

# Check formatting
echo "  → Checking format..."
pnpm format:check || {
  echo "❌ Format check failed. Run 'pnpm format' to fix."
  exit 1
}

# Type check
echo "  → Type checking..."
pnpm type-check || {
  echo "❌ Type check failed. Please fix TypeScript errors."
  exit 1
}

echo "✅ Pre-commit checks passed!"
EOF

# Commit-msg hook for conventional commits
cat > "${HOOKS_DIR}/commit-msg" << 'EOF'
#!/bin/bash

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Conventional commits pattern
pattern="^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?: .{1,100}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Commit message must follow Conventional Commits format:"
  echo "  <type>(<scope>): <subject>"
  echo ""
  echo "Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert"
  echo ""
  echo "Examples:"
  echo "  feat(auth): add two-factor authentication"
  echo "  fix(todos): resolve drag and drop issue"
  echo "  docs: update README with new features"
  exit 1
fi

echo "✅ Commit message is valid"
EOF

# Make hooks executable
chmod +x "${HOOKS_DIR}/pre-commit"
chmod +x "${HOOKS_DIR}/commit-msg"

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: Runs linting, formatting, and type checking"
echo "  • commit-msg: Validates commit message format"

