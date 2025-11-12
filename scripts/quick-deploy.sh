#!/bin/bash

# Quick deploy script - no CI/CD needed
# Usage: ./scripts/quick-deploy.sh

set -e

echo "🚀 Quick Deploy Script"
echo "====================="
echo ""

# Function to deploy client
deploy_client() {
    echo "📦 Deploying Client to Vercel..."
    cd apps/client
    vercel --prod
    cd ../..
    echo "✅ Client deployed!"
}

# Function to deploy server
deploy_server() {
    echo "🖥️  Server Deployment Options:"
    echo "1. Railway: railway up"
    echo "2. SSH: Use SERVER_HOST and SERVER_SSH_KEY"
    echo "3. Docker: docker-compose up -d"
    echo ""
    read -p "Choose deployment method (1/2/3): " choice
    
    case $choice in
        1)
            if command -v railway &> /dev/null; then
                railway up
            else
                echo "Install Railway CLI: npm i -g @railway/cli"
            fi
            ;;
        2)
            echo "SSH deployment to: ${SERVER_HOST}"
            # Add your SSH deployment commands here
            ;;
        3)
            docker-compose build
            docker-compose up -d
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
}

# Main menu
echo "What do you want to deploy?"
echo "1. Client (Vercel)"
echo "2. Server"
echo "3. Both"
echo ""
read -p "Choose (1/2/3): " deploy_choice

case $deploy_choice in
    1)
        deploy_client
        ;;
    2)
        deploy_server
        ;;
    3)
        deploy_client
        deploy_server
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"

