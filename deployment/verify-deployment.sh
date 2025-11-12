#!/bin/bash

# Deployment Verification Script

set -e

echo "🔍 Todo App Deployment Verification"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# Check backend service
echo -e "${BLUE}1. Checking backend service...${NC}"
if systemctl is-active --quiet todo-backend; then
  echo -e "${GREEN}✅ Backend service is running${NC}"
else
  echo -e "${RED}❌ Backend service is not running${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check cloudflare tunnel service
echo -e "${BLUE}2. Checking Cloudflare tunnel...${NC}"
if systemctl is-active --quiet cloudflare-tunnel; then
  echo -e "${GREEN}✅ Cloudflare tunnel is running${NC}"
else
  echo -e "${RED}❌ Cloudflare tunnel is not running${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Get tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /var/log/cloudflare-tunnel-stderr.log 2>/dev/null | tail -1)
if [ -n "$TUNNEL_URL" ]; then
  echo -e "${GREEN}✅ Tunnel URL: $TUNNEL_URL${NC}"
else
  echo -e "${RED}❌ Could not find tunnel URL${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check backend health
echo -e "${BLUE}3. Checking backend health...${NC}"
if [ -n "$TUNNEL_URL" ]; then
  HEALTH=$(curl -s -f "$TUNNEL_URL/health" 2>/dev/null)
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "   Response: $HEALTH"
  else
    echo -e "${RED}❌ Backend health check failed${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠️  Skipping health check (no tunnel URL)${NC}"
fi

# Check MongoDB
echo -e "${BLUE}4. Checking MongoDB...${NC}"
if systemctl is-active --quiet mongod 2>/dev/null || pgrep -x mongod > /dev/null; then
  echo -e "${GREEN}✅ MongoDB is running${NC}"
else
  echo -e "${YELLOW}⚠️  MongoDB might not be running as a service${NC}"
fi

# Check services are enabled
echo -e "${BLUE}5. Checking auto-start configuration...${NC}"
if systemctl is-enabled --quiet todo-backend; then
  echo -e "${GREEN}✅ Backend auto-start enabled${NC}"
else
  echo -e "${RED}❌ Backend auto-start not enabled${NC}"
  ERRORS=$((ERRORS + 1))
fi

if systemctl is-enabled --quiet cloudflare-tunnel; then
  echo -e "${GREEN}✅ Tunnel auto-start enabled${NC}"
else
  echo -e "${RED}❌ Tunnel auto-start not enabled${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "===================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
  echo ""
  echo "Your deployment is ready for CI/CD!"
  echo ""
  echo "Next steps:"
  echo "1. Run: ./deployment/github-secrets-helper.sh"
  echo "2. Add the secrets to your GitHub repository"
  echo "3. Push to main branch to trigger deployment"
  exit 0
else
  echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "- Check logs: journalctl -u todo-backend -n 50"
  echo "- Check tunnel: journalctl -u cloudflare-tunnel -n 50"
  echo "- Restart services: systemctl restart todo-backend cloudflare-tunnel"
  exit 1
fi

