#!/bin/bash

# Direct Vercel deployment script (no GitHub Actions needed)
# Usage: ./scripts/deploy-vercel.sh [production|preview]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying to Vercel (${ENVIRONMENT})..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

cd apps/client

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌍 Deploying to production..."
    vercel --prod
else
    echo "👀 Creating preview deployment..."
    vercel
fi

echo "✅ Deployment complete!"

