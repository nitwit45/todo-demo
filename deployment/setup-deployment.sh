#!/bin/bash

set -e

echo "🚀 Todo App Deployment Setup"
echo "============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Step 1: Building Backend${NC}"
cd /opt/todo/todo-demo
pnpm install --frozen-lockfile
cd apps/server
pnpm build
echo -e "${GREEN}✅ Backend built successfully${NC}"
echo ""

echo -e "${BLUE}📋 Step 2: Installing Systemd Services${NC}"

# Install backend service
cp /opt/todo/todo-demo/deployment/todo-backend.service /etc/systemd/system/
echo -e "${GREEN}✅ Backend service installed${NC}"

# Install Cloudflare tunnel service
cp /opt/todo/todo-demo/deployment/cloudflare-tunnel.service /etc/systemd/system/
echo -e "${GREEN}✅ Cloudflare tunnel service installed${NC}"
echo ""

echo -e "${BLUE}📋 Step 3: Configuring Services${NC}"

# Reload systemd
systemctl daemon-reload
echo -e "${GREEN}✅ Systemd reloaded${NC}"

# Enable services to start on boot
systemctl enable todo-backend
systemctl enable cloudflare-tunnel
echo -e "${GREEN}✅ Services enabled for auto-start${NC}"
echo ""

echo -e "${BLUE}📋 Step 4: Starting Services${NC}"

# Stop any existing instances
pkill -f "node.*dist/index.js" || true
pkill -f cloudflared || true
sleep 2

# Start backend
systemctl start todo-backend
sleep 3
echo -e "${GREEN}✅ Backend service started${NC}"

# Start Cloudflare tunnel
systemctl start cloudflare-tunnel
sleep 5
echo -e "${GREEN}✅ Cloudflare tunnel started${NC}"
echo ""

echo -e "${BLUE}📋 Step 5: Checking Service Status${NC}"
echo ""
echo "Backend Status:"
systemctl status todo-backend --no-pager || true
echo ""
echo "Cloudflare Tunnel Status:"
systemctl status cloudflare-tunnel --no-pager || true
echo ""

echo -e "${BLUE}📋 Step 6: Getting Cloudflare Tunnel URL${NC}"
echo ""
echo -e "${YELLOW}⏳ Waiting for tunnel to establish...${NC}"
sleep 10

# Try to find the tunnel URL from logs
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /var/log/cloudflare-tunnel-stderr.log 2>/dev/null | tail -1)

if [ -n "$TUNNEL_URL" ]; then
  echo -e "${GREEN}✅ Cloudflare Tunnel URL: $TUNNEL_URL${NC}"
  echo ""
  echo -e "${YELLOW}📝 IMPORTANT: Save this URL!${NC}"
  echo "   You'll need to add it as a GitHub secret: CLOUDFLARE_TUNNEL_URL"
  echo "   You'll also need to update your Vercel deployment with this URL"
  echo ""
  
  # Test backend health
  echo -e "${BLUE}🔍 Testing backend health...${NC}"
  sleep 2
  if curl -f -s "$TUNNEL_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
    curl -s "$TUNNEL_URL/health" | jq . || curl -s "$TUNNEL_URL/health"
  else
    echo -e "${RED}❌ Backend health check failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Could not automatically detect tunnel URL${NC}"
  echo "   Check logs: tail -f /var/log/cloudflare-tunnel-stderr.log"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo ""
echo "1. Add GitHub Secrets:"
echo "   - SERVER_SSH_KEY: Your SSH private key for this server"
echo "   - SERVER_HOST: $(hostname -I | awk '{print $1}')"
echo "   - CLOUDFLARE_TUNNEL_URL: $TUNNEL_URL"
echo "   - VERCEL_TOKEN: Your Vercel token"
echo "   - VERCEL_ORG_ID: Your Vercel organization ID"
echo "   - VERCEL_PROJECT_ID: Your Vercel project ID"
echo ""
echo "2. Update Backend CORS:"
echo "   Edit /opt/todo/todo-demo/deployment/todo-backend.service"
echo "   Update CORS_ORIGIN with your Vercel domain"
echo ""
echo "3. Manage Services:"
echo "   - View backend logs: journalctl -u todo-backend -f"
echo "   - View tunnel logs: journalctl -u cloudflare-tunnel -f"
echo "   - Restart backend: systemctl restart todo-backend"
echo "   - Restart tunnel: systemctl restart cloudflare-tunnel"
echo ""
echo "4. Test the deployment:"
echo "   - Push to main branch"
echo "   - Watch GitHub Actions run"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"

