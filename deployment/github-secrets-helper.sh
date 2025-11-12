#!/bin/bash

# GitHub Secrets Helper Script
# This script generates the secrets you need to add to your GitHub repository

echo "🔐 GitHub Secrets Configuration"
echo "================================"
echo ""
echo "Add these secrets to your GitHub repository:"
echo "Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "1️⃣  SERVER_HOST"
echo "   Value: $SERVER_IP"
echo ""

# Get Cloudflare tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /var/log/cloudflare-tunnel-stderr.log 2>/dev/null | tail -1)
if [ -n "$TUNNEL_URL" ]; then
  echo "2️⃣  CLOUDFLARE_TUNNEL_URL"
  echo "   Value: $TUNNEL_URL"
  echo ""
else
  echo "2️⃣  CLOUDFLARE_TUNNEL_URL"
  echo "   Value: (Check logs: tail -f /var/log/cloudflare-tunnel-stderr.log)"
  echo ""
fi

echo "3️⃣  SERVER_SSH_KEY"
echo "   Value: Your SSH private key for this server"
echo "   Generate with: ssh-keygen -t ed25519 -C 'github-actions'"
echo "   Then add the public key to: ~/.ssh/authorized_keys"
echo ""

echo "4️⃣  VERCEL_TOKEN"
echo "   Get from: https://vercel.com/account/tokens"
echo "   Create a new token with deployment permissions"
echo ""

echo "5️⃣  VERCEL_ORG_ID"
echo "   Value: ipvA5EJI8n9WNLkFAtMiPKgZ"
echo "   (From your User ID in account settings)"
echo ""

echo "6️⃣  VERCEL_PROJECT_ID"
echo "   Value: prj_luctuq5sKMeKDYVaLD6wUjEHHC1U"
echo "   (From your project settings)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Quick Commands:"
echo ""
echo "  # Using GitHub CLI (gh):"
echo "  gh secret set SERVER_HOST -b\"$SERVER_IP\""
if [ -n "$TUNNEL_URL" ]; then
  echo "  gh secret set CLOUDFLARE_TUNNEL_URL -b\"$TUNNEL_URL\""
fi
echo "  gh secret set SERVER_SSH_KEY < ~/.ssh/id_ed25519"
echo "  gh secret set VERCEL_TOKEN -b\"your-vercel-token\""
echo "  gh secret set VERCEL_ORG_ID -b\"ipvA5EJI8n9WNLkFAtMiPKgZ\""
echo "  gh secret set VERCEL_PROJECT_ID -b\"prj_luctuq5sKMeKDYVaLD6wUjEHHC1U\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

