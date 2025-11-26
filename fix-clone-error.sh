#!/bin/bash

# Script xử lý lỗi "destination path already exists" khi clone
# Sử dụng: ./fix-clone-error.sh

set -e

PROJECT_DIR="/var/www/it-request-tracking"
REPO_URL="https://github.com/HaiNguyen26/IT-Request.git"

echo "=========================================="
echo "  Fix Clone Error"
echo "=========================================="
echo ""

cd /var/www

# Kiểm tra thư mục đã tồn tại
if [ -d "$PROJECT_DIR" ]; then
    echo "Directory $PROJECT_DIR already exists"
    echo ""
    echo "Options:"
    echo "  1. Remove and clone fresh (recommended)"
    echo "  2. Initialize git in existing directory"
    echo ""
    read -p "Choose option (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "Removing existing directory..."
        rm -rf "$PROJECT_DIR"
        echo "✓ Directory removed"
        echo ""
        echo "Cloning repository..."
        git clone "$REPO_URL" it-request-tracking
        echo "✓ Repository cloned"
    elif [ "$choice" = "2" ]; then
        echo "Initializing git in existing directory..."
        cd "$PROJECT_DIR"
        
        if [ -d ".git" ]; then
            echo "Already a git repository, pulling latest..."
            git pull origin main
        else
            echo "Initializing git repository..."
            git init
            git remote add origin "$REPO_URL"
            git fetch origin
            git checkout -b main origin/main
            echo "✓ Git initialized and code pulled"
        fi
    else
        echo "Invalid choice. Exiting."
        exit 1
    fi
else
    echo "Directory does not exist, cloning..."
    git clone "$REPO_URL" it-request-tracking
    echo "✓ Repository cloned"
fi

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  cd $PROJECT_DIR"
echo "  Follow DEPLOY_GITHUB.md for deployment"
echo ""

