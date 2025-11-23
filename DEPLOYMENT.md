# 🚀 EC2 Deployment Guide

Deploy WhatsApp Broadcast SaaS to your Mumbai EC2 instance (43.205.192.171)

## 📋 Prerequisites

- EC2 instance running (Ubuntu/Amazon Linux)
- SSH access to the server
- Domain name (optional, but recommended)
- Supabase database set up

---

## 🔧 Step 1: Connect to EC2

```bash
ssh -i your-key.pem ubuntu@43.205.192.171
```

---

## 📦 Step 2: Install Node.js

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## 📁 Step 3: Clone & Setup Project

```bash
# Navigate to apps directory
cd /home/ubuntu
mkdir -p apps
cd apps

# Clone your repository
git clone https://github.com/YOUR_USERNAME/whatsapp-broadcast-saas.git
cd whatsapp-broadcast-saas

# Install dependencies
npm install
```

---

## 🔐 Step 4: Configure Environment

```bash
# Create .env file
nano .env
```

Add the following (replace with your actual values):

```env
# Server
PORT=8080
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Waha Cloud (for premium users)
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=your-waha-api-key
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🗄️ Step 5: Setup Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project (or use existing)
3. Go to SQL Editor
4. Copy contents from `database-schema.sql`
5. Execute the SQL
6. Get your Supabase URL and anon key from Settings → API

---

## 🔥 Step 6: Install & Configure PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start server.js --name whatsapp-broadcast

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

---

## 🌐 Step 7: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/whatsapp-broadcast
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 43.205.192.171;  # Change to your domain if you have one

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/whatsapp-broadcast /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 8: Setup SSL (Optional but Recommended)

If you have a domain name:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

Update Nginx config server_name to your domain.

---

## 🔥 Step 9: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 8080  # Node.js (optional, if you want direct access)
sudo ufw enable
```

---

## 📊 Step 10: Monitor Application

```bash
# View logs
pm2 logs whatsapp-broadcast

# Monitor status
pm2 status

# Monitor with dashboard
pm2 monit

# Restart application
pm2 restart whatsapp-broadcast

# Stop application
pm2 stop whatsapp-broadcast
```

---

## 🔄 Step 11: Update Deployment (Future Updates)

```bash
# SSH to server
ssh -i your-key.pem ubuntu@43.205.192.171

# Navigate to project
cd /home/ubuntu/apps/whatsapp-broadcast-saas

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Restart application
pm2 restart whatsapp-broadcast
```

---

## 🧪 Step 12: Test Your Deployment

1. **Health Check**:
   ```bash
   curl http://43.205.192.171/health
   ```

2. **Access Application**:
   - Open browser: `http://43.205.192.171`
   - You should see the login page

3. **Register a Test Account**:
   - Create an account
   - Login
   - Check dashboard loads

---

## 🐛 Troubleshooting

### Application won't start:
```bash
# Check logs
pm2 logs whatsapp-broadcast

# Check Node.js is installed
node --version

# Check if port 8080 is in use
sudo lsof -i :8080
```

### Can't access from browser:
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check firewall
sudo ufw status
```

### Database connection issues:
```bash
# Verify .env file
cat .env

# Test Supabase connection from server
curl https://your-project.supabase.co
```

### PM2 issues:
```bash
# Delete and restart PM2
pm2 delete whatsapp-broadcast
pm2 start server.js --name whatsapp-broadcast
pm2 save
```

---

## 📝 Useful Commands

```bash
# View all PM2 processes
pm2 list

# View detailed info
pm2 info whatsapp-broadcast

# View logs in real-time
pm2 logs whatsapp-broadcast --lines 100

# Clear logs
pm2 flush

# Restart Nginx
sudo systemctl restart nginx

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 🎯 Post-Deployment Checklist

- [ ] Application is running on PM2
- [ ] Nginx reverse proxy is configured
- [ ] Firewall rules are set
- [ ] SSL certificate is installed (if using domain)
- [ ] Environment variables are set correctly
- [ ] Database connection is working
- [ ] Can access application from browser
- [ ] Registration and login work
- [ ] Dashboard loads correctly
- [ ] PM2 startup script is enabled

---

## 🆘 Need Help?

- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check application logs: `pm2 logs whatsapp-broadcast`
- Restart everything: `pm2 restart all && sudo systemctl restart nginx`

---

## 🚀 Quick Deploy Script

Save this as `deploy.sh` on your server:

```bash
#!/bin/bash

echo "🚀 Deploying WhatsApp Broadcast SaaS..."

# Navigate to project
cd /home/ubuntu/apps/whatsapp-broadcast-saas

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Restart application
echo "🔄 Restarting application..."
pm2 restart whatsapp-broadcast

echo "✅ Deployment complete!"
echo "📊 View logs: pm2 logs whatsapp-broadcast"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```
