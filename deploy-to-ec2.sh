#!/bin/bash

# ========================================
# EC2 Deployment Script
# WhatsApp Broadcast SaaS
# ========================================

set -e  # Exit on error

echo "🚀 Starting EC2 Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="whatsapp-broadcast-saas"
APP_DIR="/home/ubuntu/apps/AI-Salesmate-Broadcast"
REPO_URL="https://github.com/qutubkothari/AI-Salesmate-Broadcast.git"

echo -e "${BLUE}📦 Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${BLUE}📦 Step 2: Installing Node.js 18.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed${NC}"
else
    echo -e "${GREEN}✓ Node.js already installed${NC}"
fi

echo -e "${BLUE}📦 Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

echo -e "${BLUE}📦 Step 4: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

echo -e "${BLUE}📁 Step 5: Setting up application directory...${NC}"
sudo mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps

if [ -d "$APP_DIR" ]; then
    echo -e "${BLUE}📁 Application directory exists, pulling latest changes...${NC}"
    cd $APP_DIR
    git pull origin main
else
    echo -e "${BLUE}📁 Cloning repository...${NC}"
    git clone $REPO_URL
    cd $APP_DIR
fi

echo -e "${BLUE}📦 Step 6: Installing dependencies...${NC}"
npm install --production

echo -e "${BLUE}🔐 Step 7: Checking environment file...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo -e "${BLUE}Creating .env template...${NC}"
    cat > .env << 'EOF'
# Server Configuration
PORT=8080
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Waha Cloud Configuration (Optional)
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=your-waha-api-key
EOF
    echo -e "${RED}⚠️  Please edit .env file with your actual credentials before continuing!${NC}"
    echo -e "${BLUE}Run: nano .env${NC}"
    exit 1
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo -e "${BLUE}🔥 Step 8: Starting application with PM2...${NC}"
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start server.js --name $APP_NAME --node-args="--max-old-space-size=2048"
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo -e "${BLUE}🌐 Step 9: Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << 'EOF'
server {
    listen 80;
    server_name 43.205.192.171;

    # Increase body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl restart nginx

echo -e "${BLUE}🔥 Step 10: Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Application Status:${NC}"
pm2 status
echo ""
echo -e "${BLUE}Access your application:${NC}"
echo -e "  🌐 http://43.205.192.171"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  pm2 logs $APP_NAME       - View logs"
echo -e "  pm2 restart $APP_NAME    - Restart app"
echo -e "  pm2 stop $APP_NAME       - Stop app"
echo -e "  pm2 monit                - Monitor resources"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Configure your Supabase database"
echo -e "  2. Set up domain name (optional)"
echo -e "  3. Configure SSL with Let's Encrypt"
echo ""
