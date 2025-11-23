# Quick EC2 Deployment Commands

## One-Line Deployment
```bash
wget -O - https://raw.githubusercontent.com/qutubkothari/AI-Salesmate-Broadcast/main/deploy-to-ec2.sh | bash
```

## Manual Deployment Steps

### 1. Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@43.205.192.171
```

### 2. Quick Setup
```bash
# Clone and setup
cd /home/ubuntu
mkdir -p apps && cd apps
git clone https://github.com/qutubkothari/AI-Salesmate-Broadcast.git
cd AI-Salesmate-Broadcast

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
nano .env  # Edit with your credentials

# Start with PM2
pm2 start server.js --name whatsapp-broadcast-saas
pm2 save
pm2 startup
```

### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/whatsapp-broadcast
```

Add:
```nginx
server {
    listen 80;
    server_name 43.205.192.171;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-broadcast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Open Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

## Access Application
- http://43.205.192.171

## Useful Commands
```bash
pm2 logs whatsapp-broadcast-saas    # View logs
pm2 restart whatsapp-broadcast-saas # Restart
pm2 monit                           # Monitor
```
