#!/bin/bash

# Script tự động triển khai IT Request Tracking lên Ubuntu Server
# Sử dụng: ./deploy.sh

set -e  # Dừng nếu có lỗi

echo "=========================================="
echo "  IT Request Tracking - Deploy Script"
echo "=========================================="
echo ""

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Biến
PROJECT_DIR="/var/www/it-request-tracking"
SERVER_IP="27.71.16.15"

# Hàm kiểm tra command
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        exit 1
    fi
}

# Kiểm tra các command cần thiết
echo -e "${YELLOW}[1/10] Checking prerequisites...${NC}"
check_command node
check_command npm
check_command nginx
check_command pm2
echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Tạo thư mục dự án
echo -e "${YELLOW}[2/10] Creating project directory...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
echo -e "${GREEN}✓ Directory created${NC}"
echo ""

# Kiểm tra code đã có chưa
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Code not found in $PROJECT_DIR${NC}"
    echo "Please upload your code first using SCP or Git"
    exit 1
fi

# Cài đặt dependencies
echo -e "${YELLOW}[3/10] Installing dependencies...${NC}"
npm install
npm run postinstall
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Kiểm tra file .env
echo -e "${YELLOW}[4/10] Checking environment configuration...${NC}"
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}Warning: server/.env not found. Creating from template...${NC}"
    cat > server/.env << EOF
PORT=4000
DATABASE_URL=postgresql://it_user:your_password@localhost:5432/it_request_tracking
NODE_ENV=production
EOF
    echo -e "${YELLOW}Please edit server/.env with your database credentials${NC}"
    read -p "Press Enter after editing .env file..."
fi
echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Build server
echo -e "${YELLOW}[5/10] Building server...${NC}"
cd server
npm run build
cd ..
echo -e "${GREEN}✓ Server built${NC}"
echo ""

# Build webapp
echo -e "${YELLOW}[6/10] Building webapp...${NC}"
cd webapp
export VITE_API_URL="http://${SERVER_IP}/api"
npm run build
cd ..
echo -e "${GREEN}✓ Webapp built${NC}"
echo ""

# Tạo thư mục uploads
echo -e "${YELLOW}[7/10] Creating uploads directory...${NC}"
mkdir -p server/uploads
chmod 755 server/uploads
echo -e "${GREEN}✓ Uploads directory created${NC}"
echo ""

# Cấu hình PM2
echo -e "${YELLOW}[8/10] Configuring PM2...${NC}"
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'it-request-api',
    script: './server/dist/index.js',
    cwd: '/var/www/it-request-tracking',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/it-api-error.log',
    out_file: '/var/log/pm2/it-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
}
EOF
fi

mkdir -p /var/log/pm2

# Restart PM2
pm2 delete it-request-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ PM2 configured${NC}"
echo ""

# Cấu hình Nginx
echo -e "${YELLOW}[9/10] Configuring Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/it-request-tracking"

cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    access_log /var/log/nginx/it-request-access.log;
    error_log /var/log/nginx/it-request-error.log;

    root ${PROJECT_DIR}/webapp/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/uploads {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/it-request-tracking
rm -f /etc/nginx/sites-enabled/default

# Test và reload Nginx
nginx -t
systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

# Kiểm tra
echo -e "${YELLOW}[10/10] Verifying deployment...${NC}"
sleep 2

# Kiểm tra PM2
if pm2 list | grep -q "it-request-api.*online"; then
    echo -e "${GREEN}✓ PM2 process is running${NC}"
else
    echo -e "${RED}✗ PM2 process is not running${NC}"
fi

# Kiểm tra Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
fi

# Kiểm tra API
if curl -s http://localhost:4000/health > /dev/null; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${RED}✗ API is not responding${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment completed!${NC}"
echo "=========================================="
echo ""
echo "Access your application at:"
echo -e "${GREEN}http://${SERVER_IP}${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check PM2 status"
echo "  pm2 logs it-request-api - View API logs"
echo "  systemctl status nginx  - Check Nginx status"
echo "  nginx -t                - Test Nginx config"
echo ""

