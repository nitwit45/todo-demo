#!/bin/bash

# Fresh Vercel deployment with proper monorepo configuration
# This will unlink the old project and create a new one with correct settings

set -e

echo "🔄 Fresh Vercel deployment (monorepo-aware)"
echo "==========================================="
echo ""

cd apps/client

# Remove old Vercel link
if [ -d ".vercel" ]; then
    echo "🗑️  Removing old Vercel configuration..."
    rm -rf .vercel
fi

echo "📦 Building validation package..."
cd ../../packages/validation
pnpm build
cd ../../apps/client

echo ""
echo "🚀 Starting Vercel deployment..."
echo ""
echo "When prompted:"
echo "  1. Scope: nitwit45's projects"
echo "  2. Link to existing project: NO (create new)"
echo "  3. Project name: todo-app-client"
echo "  4. Directory: ./ (it's already in apps/client)"
echo ""

# Deploy with production flag
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Note: Vercel will auto-detect the monorepo structure from vercel.json"

