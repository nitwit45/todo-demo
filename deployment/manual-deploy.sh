#!/bin/bash

set -e

echo "🚀 Manual Deployment Script"
echo "============================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Deploy Backend
echo -e "${BLUE}📦 Step 1: Deploying Backend${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /opt/todo/todo-demo

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔨 Building backend..."
cd apps/server
pnpm build

echo "♻️  Restarting backend service..."
sudo systemctl restart todo-backend
sleep 3

if systemctl is-active --quiet todo-backend; then
  echo -e "${GREEN}✅ Backend deployed and running!${NC}"
else
  echo -e "${RED}❌ Backend failed to start${NC}"
  journalctl -u todo-backend -n 20 --no-pager
  exit 1
fi

echo ""

# 2. Deploy Frontend to Vercel
echo -e "${BLUE}📦 Step 2: Deploying Frontend to Vercel${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /opt/todo/todo-demo/apps/client

# Set environment variable for build
export NEXT_PUBLIC_API_URL="https://occurred-advised-worth-opening.trycloudflare.com"

echo "🔨 Building frontend..."
pnpm build

echo "🚀 Deploying to Vercel..."
DEPLOYMENT_URL=$(vercel deploy --prod --yes 2>&1 | grep -oE 'https://[a-z0-9-]+\.vercel\.app' | tail -1)

if [ -n "$DEPLOYMENT_URL" ]; then
  echo -e "${GREEN}✅ Frontend deployed!${NC}"
  echo -e "${GREEN}🔗 URL: $DEPLOYMENT_URL${NC}"
else
  echo -e "${YELLOW}⚠️  Check Vercel dashboard for deployment status${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Service Status:"
systemctl status todo-backend --no-pager | head -5
systemctl status cloudflare-tunnel --no-pager | head -5
echo ""
echo "🔗 Backend: https://occurred-advised-worth-opening.trycloudflare.com/health"
echo "🔗 Frontend: Check Vercel dashboard or $DEPLOYMENT_URL"
echo ""
echo "💡 To deploy again, just run: ./deployment/manual-deploy.sh"

