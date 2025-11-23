# 📚 Quick Reference - All Commands

Quick reference for working with your WhatsApp Broadcast SaaS project.

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload
npm run dev

# Test health endpoint
curl http://localhost:8080/health
```

---

## 📤 Git & GitHub

```bash
# Check status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

---

## 🚀 EC2 Deployment

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@43.205.192.171

# Navigate to project
cd /home/ubuntu/apps/AI-Salesmate-Broadcast

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart with PM2
pm2 restart whatsapp-broadcast

# View logs
pm2 logs whatsapp-broadcast

# Monitor
pm2 monit
```

---

## 🔍 PM2 Commands

```bash
# Start application
pm2 start server.js --name whatsapp-broadcast

# List all processes
pm2 list

# View logs
pm2 logs whatsapp-broadcast

# Restart
pm2 restart whatsapp-broadcast

# Stop
pm2 stop whatsapp-broadcast

# Delete process
pm2 delete whatsapp-broadcast

# Save current setup
pm2 save

# Setup startup script
pm2 startup
```

---

## 🌐 Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🗄️ Supabase Quick Reference

### Connection Info
- Dashboard: https://app.supabase.com
- SQL Editor: Dashboard → SQL Editor
- API Keys: Dashboard → Settings → API

### Useful SQL Queries

```sql
-- View all tenants
SELECT * FROM tenants;

-- View all broadcasts
SELECT b.*, t.business_name 
FROM broadcasts b
JOIN tenants t ON b.tenant_id = t.id;

-- Count broadcasts by status
SELECT status, COUNT(*) 
FROM broadcasts 
GROUP BY status;

-- View recent broadcasts
SELECT * FROM broadcasts 
ORDER BY created_at DESC 
LIMIT 10;

-- Clear all data (CAREFUL!)
TRUNCATE TABLE broadcast_recipients, desktop_agent_queue, broadcasts, tenants CASCADE;
```

---

## 🧪 API Testing (cURL)

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Co","email":"test@test.com","password":"test123","plan":"basic"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Create Broadcast
```bash
curl -X POST http://localhost:8080/api/broadcasts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test","message":"Hi","recipients":["919876543210"]}'
```

### Get Broadcasts
```bash
curl http://localhost:8080/api/broadcasts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔥 Troubleshooting Commands

### Check Port Usage (Windows)
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Check Port Usage (Linux)
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
```

### Check Disk Space
```bash
df -h
```

### Check Memory
```bash
free -h
```

### Check Node Version
```bash
node --version
npm --version
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🔒 Security Checklist

- [ ] `.env` file is NOT in Git
- [ ] `.gitignore` includes `.env`
- [ ] Using strong JWT secret in production
- [ ] Supabase RLS policies are set (optional)
- [ ] SSL certificate installed (for production)
- [ ] Firewall configured on EC2
- [ ] Regular backups of Supabase database

---

## 📊 Monitoring & Logs

### Server Logs
```bash
# Local development
# Check terminal where npm start is running

# Production (PM2)
pm2 logs whatsapp-broadcast
pm2 logs whatsapp-broadcast --lines 100
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Logs
```bash
sudo journalctl -u nginx -f
sudo journalctl -xe
```

---

## 🔄 Update Workflow

### Local Changes → GitHub → EC2

1. **Make changes locally**
2. **Test locally**: `npm run dev`
3. **Commit**: `git add . && git commit -m "message"`
4. **Push**: `git push`
5. **SSH to EC2**: `ssh ubuntu@43.205.192.171`
6. **Update**: `cd /home/ubuntu/apps/whatsapp-broadcast-saas && git pull`
7. **Restart**: `pm2 restart whatsapp-broadcast`

---

## 📁 Project Structure Reference

```
whatsapp-broadcast-saas/
├── config/
│   └── database.js          # Supabase connection
├── middleware/
│   └── auth.js              # JWT middleware
├── routes/
│   ├── auth.js              # Register/Login
│   ├── whatsapp.js          # Waha integration
│   ├── broadcast.js         # Broadcast CRUD
│   └── desktopAgent.js      # Agent queue
├── public/
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   └── dashboard.html       # Main dashboard
├── .env                     # Environment variables (NOT in Git)
├── .env.example             # Template
├── .gitignore               # Git ignore rules
├── database-schema.sql      # Database setup
├── package.json             # Dependencies
├── server.js                # Main server
├── README.md                # Project overview
├── DEPLOYMENT.md            # EC2 deployment guide
├── GITHUB_SETUP.md          # GitHub instructions
└── TESTING.md               # Local testing guide
```

---

## 🎯 Important URLs

- **Local**: http://localhost:8080
- **Production**: http://43.205.192.171 (or your domain)
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repo**: https://github.com/YOUR_USERNAME/AI-Salesmate-Broadcast

---

## 🆘 Emergency Commands

### Restart Everything
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Stop Everything
```bash
pm2 stop all
sudo systemctl stop nginx
```

### Check What's Running
```bash
pm2 list
sudo systemctl status nginx
ps aux | grep node
```

### Kill All Node Processes (CAREFUL!)
```bash
# Linux
pkill -9 node

# Windows
taskkill /F /IM node.exe
```

---

## 📞 Support Resources

- Node.js Docs: https://nodejs.org/docs
- Express.js: https://expressjs.com
- Supabase: https://supabase.com/docs
- PM2: https://pm2.keymetrics.io
- Nginx: https://nginx.org/en/docs
