# 🗄️ Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to: https://app.supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name:** WhatsApp Broadcast SaaS
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to Mumbai (ap-south-1)
4. Click **"Create new project"** (takes ~2 minutes)

---

## Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `database-schema.sql` from your project
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see: ✅ Success. No rows returned

---

## Step 3: Get Your Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

---

## Step 4: Update EC2 Environment

Run this command in PowerShell (update with your actual values):

```powershell
$SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co"
$SUPABASE_KEY = "your-actual-anon-key-here"

ssh -i "$HOME\Downloads\salesmate.pem" ubuntu@43.205.192.171 @"
cat > /home/ubuntu/apps/AI-Salesmate-Broadcast/.env << 'EOF'
PORT=8080
NODE_ENV=production
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
JWT_SECRET=$(node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))')
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=
EOF

cd /home/ubuntu/apps/AI-Salesmate-Broadcast
pm2 restart whatsapp-broadcast-saas
pm2 logs whatsapp-broadcast-saas --lines 20
"@
```

---

## Step 5: Verify It's Working

Test the health endpoint:
```powershell
Invoke-RestMethod -Uri "http://43.205.192.171:8080/health"
```

You should see:
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "healthy"
    }
  }
}
```

---

## Quick Copy-Paste Command

Replace `YOUR_URL` and `YOUR_KEY` below and run:

```powershell
ssh -i "$HOME\Downloads\salesmate.pem" ubuntu@43.205.192.171 "cd /home/ubuntu/apps/AI-Salesmate-Broadcast && cat > .env << 'EOF'
PORT=8080
NODE_ENV=production
SUPABASE_URL=YOUR_URL_HERE
SUPABASE_KEY=YOUR_KEY_HERE
JWT_SECRET=change-me-to-random-32-char-string
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=
EOF
pm2 restart whatsapp-broadcast-saas"
```

---

## ✅ Done!

Your app is now connected to Supabase! 

**Access your app:**
- http://43.205.192.171:8080

**Deploy updates:**
```powershell
.\deploy.ps1
```
