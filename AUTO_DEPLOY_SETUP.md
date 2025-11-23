# 🚀 GitHub Actions Auto-Deployment Setup

## Overview
This setup enables automatic deployment to EC2 whenever you push to the `main` branch.

---

## 📋 Setup Instructions

### Step 1: Add GitHub Secrets

Go to your GitHub repository:
1. Navigate to: `https://github.com/qutubkothari/AI-Salesmate-Broadcast/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these 3 secrets:

#### Secret 1: EC2_HOST
- **Name:** `EC2_HOST`
- **Value:** `43.205.192.171`

#### Secret 2: EC2_USERNAME
- **Name:** `EC2_USERNAME`
- **Value:** `ubuntu`

#### Secret 3: EC2_SSH_KEY
- **Name:** `EC2_SSH_KEY`
- **Value:** Your entire `.pem` file content

**To get your .pem file content:**

**On Windows PowerShell:**
```powershell
Get-Content "C:\Users\musta\Downloads\salesmate.pem" | Out-String
```

**Or open the file and copy everything:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(all the content)
...
-----END RSA PRIVATE KEY-----
```

---

### Step 2: Initial EC2 Setup (One-Time Only)

SSH into your EC2 and run this **once**:

```bash
ssh -i "C:\Users\musta\Downloads\salesmate.pem" ubuntu@43.205.192.171
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

# Create app directory
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps

# Clone repository
git clone https://github.com/qutubkothari/AI-Salesmate-Broadcast.git
cd AI-Salesmate-Broadcast

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Add to .env:**
```env
PORT=8080
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
```

**Start the app:**
```bash
pm2 start server.js --name whatsapp-broadcast-saas
pm2 save
pm2 startup
```

**Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/whatsapp-broadcast
```

Add:
```nginx
server {
    listen 80;
    server_name 43.205.192.171;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable and restart:**
```bash
sudo ln -sf /etc/nginx/sites-available/whatsapp-broadcast /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 3: Test Auto-Deployment

1. Make any change to your code
2. Commit and push:
```powershell
git add .
git commit -m "Test auto-deployment"
git push origin main
```

3. Watch the deployment:
   - Go to: `https://github.com/qutubkothari/AI-Salesmate-Broadcast/actions`
   - You'll see the workflow running
   - Green checkmark = successful deployment ✅

---

## 🎯 How It Works

**Every time you push to `main` branch:**
1. ✅ GitHub Actions triggers automatically
2. ✅ Connects to your EC2 via SSH
3. ✅ Pulls latest code from GitHub
4. ✅ Installs any new dependencies
5. ✅ Restarts the application with PM2
6. ✅ Your app is updated with zero downtime!

---

## 🔍 Monitoring Deployments

### View GitHub Actions Logs
```
https://github.com/qutubkothari/AI-Salesmate-Broadcast/actions
```

### View EC2 Application Logs
```bash
ssh -i "your-key.pem" ubuntu@43.205.192.171
pm2 logs whatsapp-broadcast-saas
```

### Check Application Status
```bash
pm2 status
pm2 monit
```

---

## 🐛 Troubleshooting

### Deployment fails with "Permission denied"
- Check that EC2_SSH_KEY secret contains the complete .pem file content
- Ensure the key includes BEGIN and END lines

### Deployment fails with "git pull failed"
SSH into EC2 and reset:
```bash
cd /home/ubuntu/apps/AI-Salesmate-Broadcast
git reset --hard origin/main
git pull origin main
```

### Application not restarting
```bash
pm2 delete whatsapp-broadcast-saas
pm2 start server.js --name whatsapp-broadcast-saas
pm2 save
```

---

## ✨ Benefits

- 🚀 **Zero-effort deployment** - Just push code
- ⚡ **Fast updates** - Changes live in seconds
- 🔄 **Zero downtime** - PM2 graceful reload
- 📊 **Deployment history** - See all deployments in GitHub Actions
- 🔍 **Easy debugging** - View logs directly in GitHub

---

## 📱 Access Your App

After deployment:
- **Application:** http://43.205.192.171
- **Health Check:** http://43.205.192.171/health
- **GitHub Actions:** https://github.com/qutubkothari/AI-Salesmate-Broadcast/actions

---

**That's it! Now every push to GitHub automatically deploys to EC2! 🎉**
