#!/bin/bash

# Script build production cho IT Request Tracking
# Sử dụng: ./build-production.sh [API_URL]
# Mặc định API_URL: http://27.71.16.15/api

set -e

API_URL="${1:-http://27.71.16.15/api}"

echo "=========================================="
echo "  Building for Production"
echo "=========================================="
echo ""
echo "API URL: $API_URL"
echo ""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build server
echo -e "${YELLOW}[1/2] Building server...${NC}"
cd server
npm run build
echo -e "${GREEN}✓ Server built${NC}"
cd ..

# Build webapp
echo -e "${YELLOW}[2/2] Building webapp...${NC}"
cd webapp
export VITE_API_URL="$API_URL"
npm run build
echo -e "${GREEN}✓ Webapp built${NC}"
cd ..

echo ""
echo -e "${GREEN}Build completed!${NC}"
echo ""
echo "Output directories:"
echo "  - server/dist/    (Backend)"
echo "  - webapp/dist/    (Frontend)"
echo ""

