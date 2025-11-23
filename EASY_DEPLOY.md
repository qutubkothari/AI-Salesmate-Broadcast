# 🚀 One-Command Deployment

## How to Deploy (Like Previous Projects!)

Just run this **ONE command** in PowerShell:

```powershell
.\deploy.ps1
```

Or with a custom message:

```powershell
.\deploy.ps1 -Message "Added new feature"
```

That's it! The script will:
1. ✅ Add all your changes to Git
2. ✅ Commit with your message
3. ✅ Push to GitHub
4. ✅ SSH into EC2 and deploy automatically
5. ✅ Restart the application

---

## 🎯 What It Does

- Commits and pushes your code to GitHub
- Connects to EC2 automatically
- Pulls latest code on EC2
- Installs dependencies
- Restarts the app with PM2
- Shows deployment status

---

## 📋 One-Time Setup

**First time only**, run this once on EC2:

```powershell
ssh -i "$HOME\Downloads\salesmate.pem" ubuntu@43.205.192.171
```

Then run:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone and setup
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps
git clone https://github.com/qutubkothari/AI-Salesmate-Broadcast.git
cd AI-Salesmate-Broadcast
npm install --production

# Create .env file
nano .env
```

Add your environment variables:
```env
PORT=8080
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
```

Start the app:
```bash
pm2 start server.js --name whatsapp-broadcast-saas
pm2 save
pm2 startup
```

Configure Nginx (optional):
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

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-broadcast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎉 Done!

From now on, just run:

```powershell
.\deploy.ps1
```

**Every time you want to deploy!** Just like your previous projects! 🚀

---

## 📱 Access Your App

- **Live App:** http://43.205.192.171
- **Health Check:** http://43.205.192.171/health

---

## 🔍 Troubleshooting

**If deployment fails:**

1. Check EC2 is running
2. Check SSH key path: `$HOME\Downloads\salesmate.pem`
3. Verify EC2 IP: `43.205.192.171`

**View logs on EC2:**
```bash
ssh -i "$HOME\Downloads\salesmate.pem" ubuntu@43.205.192.171
pm2 logs whatsapp-broadcast-saas
```
