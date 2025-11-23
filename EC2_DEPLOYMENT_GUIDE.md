# 🚀 EC2 Deployment Guide - Step by Step

Deploy your WhatsApp Broadcast SaaS to EC2 instance: **43.205.192.171**

---

## 📋 Prerequisites Checklist

- ✅ GitHub repository uploaded
- ✅ EC2 instance running (Ubuntu)
- ✅ SSH key (.pem file) for EC2 access
- ✅ Supabase account and database
- ⬜ Domain name (optional)

---

## 🔐 Step 1: Connect to Your EC2 Instance

### Option A: Using SSH Key File
```bash
ssh -i "your-key.pem" ubuntu@43.205.192.171
```

### Option B: Using EC2 Instance Connect (AWS Console)
1. Go to AWS EC2 Console
2. Select your instance
3. Click "Connect" → "EC2 Instance Connect"
4. Click "Connect"

---

## 🚀 Step 2: Run Automated Deployment Script

Once connected to EC2, run these commands:

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/qutubkothari/AI-Salesmate-Broadcast/main/deploy-to-ec2.sh

# Make it executable
chmod +x deploy-to-ec2.sh

# Run the deployment
./deploy-to-ec2.sh
```

The script will:
- ✅ Install Node.js 18.x
- ✅ Install PM2 (process manager)
- ✅ Install Nginx (reverse proxy)
- ✅ Clone your repository
- ✅ Install dependencies
- ✅ Configure firewall
- ✅ Start your application

---

## 🔐 Step 3: Configure Environment Variables

If the script creates a template `.env` file, edit it:

```bash
cd /home/ubuntu/apps/AI-Salesmate-Broadcast
nano .env
```

Update these values:

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Supabase Configuration (Get from https://app.supabase.com)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-actual-supabase-anon-key

# JWT Secret (Generate a strong random key)
JWT_SECRET=your-super-secret-random-jwt-key-change-this

# Waha Cloud (Optional - for premium users)
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=your-waha-api-key-if-using
```

**Save:** Press `Ctrl+O`, `Enter`, then `Ctrl+X`

---

## 🗄️ Step 4: Setup Supabase Database

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Create a new project** (or use existing)
3. **Navigate to SQL Editor**
4. **Copy contents from `database-schema.sql`** in your repo
5. **Execute the SQL** to create tables
6. **Get credentials**:
   - Go to Settings → API
   - Copy `URL` and `anon/public` key
   - Update your `.env` file

---

## 🔥 Step 5: Start the Application

```bash
cd /home/ubuntu/apps/AI-Salesmate-Broadcast

# Start with PM2
pm2 start server.js --name whatsapp-broadcast-saas

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command that PM2 outputs

# Check status
pm2 status
```

---

## 🌐 Step 6: Configure Security Group (AWS)

1. Go to **EC2 Console** → **Security Groups**
2. Select your instance's security group
3. Add **Inbound Rules**:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Node.js app |
| SSH | TCP | 22 | Your IP | SSH access |

---

## ✅ Step 7: Test Your Deployment

### Test Application Health
```bash
curl http://localhost:8080/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T...",
  "service": "WhatsApp Broadcast SaaS"
}
```

### Access Your Application
Open browser and visit:
- **http://43.205.192.171** (via Nginx)
- **http://43.205.192.171:8080** (direct to Node.js)

---

## 🔒 Step 8: Setup SSL (Optional but Recommended)

### If you have a domain name:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Management Commands

### PM2 Commands
```bash
# View logs
pm2 logs whatsapp-broadcast-saas

# Monitor resources
pm2 monit

# Restart application
pm2 restart whatsapp-broadcast-saas

# Stop application
pm2 stop whatsapp-broadcast-saas

# View detailed info
pm2 info whatsapp-broadcast-saas
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 🔄 Updating Your Application

When you push changes to GitHub:

```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@43.205.192.171

# Navigate to app directory
cd /home/ubuntu/apps/AI-Salesmate-Broadcast

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install --production

# Restart application
pm2 restart whatsapp-broadcast-saas

# Check logs
pm2 logs whatsapp-broadcast-saas --lines 50
```

---

## 🐛 Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs whatsapp-broadcast-saas --lines 100

# Check if port is in use
sudo lsof -i :8080

# Restart PM2
pm2 restart whatsapp-broadcast-saas
```

### Can't access website
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check application status
pm2 status

# Check firewall
sudo ufw status
```

### Database connection issues
```bash
# Verify .env file
cat .env | grep SUPABASE

# Test database connection
cd /home/ubuntu/apps/AI-Salesmate-Broadcast
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL);"
```

### Out of memory
```bash
# Increase PM2 memory limit
pm2 delete whatsapp-broadcast-saas
pm2 start server.js --name whatsapp-broadcast-saas --max-memory-restart 500M
pm2 save
```

---

## 📱 Access Your Application

Once deployed, you can access:

- **Login Page**: http://43.205.192.171
- **Register**: http://43.205.192.171/register
- **Dashboard**: http://43.205.192.171/dashboard.html (after login)
- **Health Check**: http://43.205.192.171/health

---

## 🎯 Quick Reference

### Environment File Location
```
/home/ubuntu/apps/AI-Salesmate-Broadcast/.env
```

### Application Directory
```
/home/ubuntu/apps/AI-Salesmate-Broadcast
```

### PM2 Process Name
```
whatsapp-broadcast-saas
```

### Default Port
```
8080
```

---

## 🆘 Need Help?

### Common Issues

**1. Port 8080 already in use**
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
pm2 restart whatsapp-broadcast-saas
```

**2. Permission denied errors**
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/apps
```

**3. Git pull fails**
```bash
cd /home/ubuntu/apps/AI-Salesmate-Broadcast
git stash
git pull origin main
```

---

## 🎉 Success Checklist

- ✅ Application running on EC2
- ✅ Accessible via http://43.205.192.171
- ✅ Environment variables configured
- ✅ Supabase database connected
- ✅ PM2 process manager running
- ✅ Nginx reverse proxy configured
- ✅ Firewall configured
- ✅ Auto-restart on reboot enabled

---

## 📚 Additional Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

**Deployment Date**: {{ date }}  
**Version**: 1.0.0  
**Server**: 43.205.192.171
