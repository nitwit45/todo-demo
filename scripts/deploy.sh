#!/bin/bash

# Quick deployment script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying to ${ENVIRONMENT}..."

# Build Docker images
echo "📦 Building Docker images..."
docker-compose build

# Tag images
VERSION=$(node -p "require('./package.json').version")
docker tag todo-app-client:latest todo-app-client:${VERSION}
docker tag todo-app-server:latest todo-app-server:${VERSION}

echo "✅ Build complete!"
echo "   Client: todo-app-client:${VERSION}"
echo "   Server: todo-app-server:${VERSION}"

# Deploy based on environment
case $ENVIRONMENT in
  production)
    echo "🌍 Deploying to production..."
    # Add your production deployment commands here
    # e.g., docker push, kubectl apply, railway deploy, etc.
    ;;
  staging)
    echo "🔧 Deploying to staging..."
    # Add your staging deployment commands here
    ;;
  *)
    echo "Unknown environment: ${ENVIRONMENT}"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"

