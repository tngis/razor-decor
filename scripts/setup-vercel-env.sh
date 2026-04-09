#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Vercel Environment Variables Setup${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✓ Vercel CLI installed${NC}"
echo ""

# List of required environment variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_ADMIN_EMAIL"
    "NEXT_PUBLIC_SITE_URL"
)

echo "Required environment variables:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "  - $var"
done
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Add all variables to Vercel (Production)"
echo "2) Add all variables to Vercel (All environments)"
echo "3) Check which variables are already set"
echo "4) Show me the commands (I'll run them manually)"
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Adding variables to Production...${NC}"
        source .env
        for var in "${REQUIRED_VARS[@]}"; do
            value="${!var}"
            if [ -n "$value" ]; then
                echo "Adding $var..."
                echo "$value" | vercel env add "$var" production
            else
                echo -e "${RED}⚠️  $var is not set in .env${NC}"
            fi
        done
        echo -e "${GREEN}✓ Done! Redeploy your app in Vercel.${NC}"
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Adding variables to all environments...${NC}"
        source .env
        for var in "${REQUIRED_VARS[@]}"; do
            value="${!var}"
            if [ -n "$value" ]; then
                echo "Adding $var to all environments..."
                echo "$value" | vercel env add "$var" production
                echo "$value" | vercel env add "$var" preview
                echo "$value" | vercel env add "$var" development
            else
                echo -e "${RED}⚠️  $var is not set in .env${NC}"
            fi
        done
        echo -e "${GREEN}✓ Done! Redeploy your app in Vercel.${NC}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Checking existing variables...${NC}"
        vercel env ls
        ;;
    4)
        echo ""
        echo "Copy and run these commands:"
        echo ""
        source .env
        for var in "${REQUIRED_VARS[@]}"; do
            value="${!var}"
            if [ -n "$value" ]; then
                echo "echo '$value' | vercel env add $var production"
            fi
        done
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Go to your Vercel dashboard"
echo "2. Trigger a new deployment (or it may auto-deploy)"
echo "3. Visit: https://your-domain.vercel.app/api/debug-env"
echo "4. Verify all environment variables are loaded"
