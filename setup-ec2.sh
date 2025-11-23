#!/bin/bash

# One-time EC2 Setup Script
echo "🚀 Setting up EC2 for AI-Salesmate-Broadcast..."

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Create app directory and clone
echo "📁 Setting up application..."
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps
git clone https://github.com/qutubkothari/AI-Salesmate-Broadcast.git
cd AI-Salesmate-Broadcast

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create .env template
echo "🔐 Creating .env template..."
cat > .env << 'EOF'
PORT=8080
NODE_ENV=production
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=
EOF

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "⚠️  IMPORTANT: Edit .env file with your credentials:"
echo "nano /home/ubuntu/apps/AI-Salesmate-Broadcast/.env"
echo ""
echo "Then start the app with:"
echo "pm2 start server.js --name whatsapp-broadcast-saas"
echo "pm2 save"
echo "pm2 startup"
