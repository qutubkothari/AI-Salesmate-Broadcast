# 🧪 Local Testing Guide

Test your WhatsApp Broadcast SaaS locally before deploying to EC2.

## 📋 Prerequisites

- Node.js 16+ installed
- Supabase account (free tier works)
- Git installed

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the example file:
```bash
copy .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=test-secret-key-change-in-production
WAHA_URL=http://43.205.192.171:3000
WAHA_API_KEY=your-waha-api-key
```

### 3. Setup Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste contents from `database-schema.sql`
4. Execute the SQL

### 4. Start Server

```bash
npm start
```

Or with auto-reload during development:
```bash
npm run dev
```

Server will start at: `http://localhost:8080`

---

## ✅ Testing Checklist

### 1. Health Check
Open browser: `http://localhost:8080/health`

Should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T...",
  "service": "WhatsApp Broadcast SaaS"
}
```

### 2. Test Registration
1. Go to `http://localhost:8080`
2. Click "Sign Up"
3. Fill in:
   - Business Name: `Test Business`
   - Email: `test@example.com`
   - Password: `test123`
   - Plan: `Basic Plan`
4. Click "Create Account"
5. Should redirect to login

### 3. Test Login
1. Enter credentials
2. Should redirect to dashboard
3. Check:
   - User name displays correctly
   - Plan badge shows correctly
   - Stats are visible (0 at first)

### 4. Test Broadcast Creation (Will be queued)
1. Click "Create Broadcast"
2. Fill in:
   - Name: `Test Broadcast`
   - Message: `Hello from WhatsApp!`
   - Recipients: `919876543210, 919876543211`
3. Click "Create Broadcast"
4. Should appear in broadcast list

---

## 🔍 API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"businessName\":\"Test Co\",\"email\":\"test@test.com\",\"password\":\"test123\",\"plan\":\"basic\"}"
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

Save the token from response!

### Create Broadcast (Premium users with Waha)
```bash
curl -X POST http://localhost:8080/api/broadcasts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Test\",\"message\":\"Hi\",\"recipients\":[\"919876543210\"]}"
```

### Get Broadcasts
```bash
curl http://localhost:8080/api/broadcasts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Start WhatsApp Session (Premium only)
```bash
curl -X POST http://localhost:8080/api/whatsapp/start-session \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get QR Code (Premium only)
```bash
curl http://localhost:8080/api/whatsapp/qr \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Testing Different User Plans

### Basic Plan User
1. Register with `plan: "basic"`
2. Should see "Desktop Agent" section
3. Should NOT see "WhatsApp Connection" section
4. Broadcasts get queued for desktop agent

### Premium Plan User
1. Register with `plan: "premium"`
2. Should see "WhatsApp Connection" section
3. Should NOT see "Desktop Agent" section
4. Can connect WhatsApp via QR code
5. Broadcasts sent directly via Waha

---

## 📊 Database Verification

### Check Supabase Tables

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Verify tables exist:
   - `tenants` - Your registered businesses
   - `broadcasts` - Created broadcasts
   - `broadcast_recipients` - Individual messages
   - `desktop_agent_queue` - Queued messages for basic plan

### Sample SQL Queries

**View all tenants:**
```sql
SELECT id, business_name, email, plan, created_at 
FROM tenants;
```

**View all broadcasts:**
```sql
SELECT b.*, t.business_name 
FROM broadcasts b
JOIN tenants t ON b.tenant_id = t.id;
```

**Check broadcast recipients:**
```sql
SELECT br.*, b.name as broadcast_name
FROM broadcast_recipients br
JOIN broadcasts b ON br.broadcast_id = b.id;
```

---

## 🐛 Troubleshooting

### Server won't start

**Error: "Cannot find module"**
```bash
npm install
```

**Error: "Port 8080 already in use"**
- Change PORT in `.env`
- Or kill the process:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Error: "Database connection failed"**
- Check SUPABASE_URL and SUPABASE_KEY in `.env`
- Verify Supabase project is active
- Check internet connection

### Frontend issues

**Error: "Network error"**
- Check server is running
- Check console for errors (F12)
- Verify API endpoints in browser DevTools → Network tab

**Login/Register not working**
- Check browser console for errors
- Verify database schema is set up
- Check server logs for errors

### Database issues

**Error: "relation 'tenants' does not exist"**
- You forgot to run `database-schema.sql`
- Go to Supabase SQL Editor and run it

**Error: "duplicate key value"**
- Email already exists
- Use different email or delete from Supabase

---

## 📝 Development Tips

### Watch Logs in Real-Time

Start server with nodemon (included):
```bash
npm run dev
```

Changes to `.js` files will auto-restart the server!

### View Server Logs

Server logs appear in terminal. Look for:
- ✅ Green = Success
- ❌ Red = Error
- ℹ️ Blue = Info

### Test Different Scenarios

1. **Multiple Users**: Register 2-3 users to test multi-tenancy
2. **Different Plans**: One basic, one premium
3. **Multiple Broadcasts**: Create several to see list
4. **Error Cases**: Try wrong password, existing email, etc.

---

## 🔄 Reset Database (If Needed)

If you want to start fresh:

1. Go to Supabase SQL Editor
2. Run:
```sql
-- Delete all data
TRUNCATE TABLE broadcast_recipients, desktop_agent_queue, broadcasts, tenants CASCADE;
```

Or drop and recreate:
```sql
-- Drop all tables
DROP TABLE IF EXISTS broadcast_recipients, desktop_agent_queue, broadcasts, tenants CASCADE;

-- Then run database-schema.sql again
```

---

## ✅ Ready for Production?

Before deploying to EC2:

- [ ] All API endpoints work locally
- [ ] Can register and login
- [ ] Can create broadcasts
- [ ] Database queries work
- [ ] Both user plans work correctly
- [ ] No errors in server logs
- [ ] Frontend loads correctly
- [ ] Environment variables are set
- [ ] .env is NOT committed to Git

---

## 🎯 Next Steps

Once local testing is successful:

1. ✅ Commit any changes: `git add .` → `git commit -m "message"`
2. 📤 Push to GitHub: `git push`
3. 🚀 Follow `DEPLOYMENT.md` to deploy to EC2
4. 🎉 Launch your SaaS!

---

## 🆘 Still Having Issues?

Check:
1. Node.js version: `node --version` (should be 16+)
2. NPM version: `npm --version`
3. Port availability: Try different port in `.env`
4. Firewall: Make sure port 8080 is not blocked
5. Supabase: Project is active and accessible

Common fixes:
```bash
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Update npm
npm install -g npm@latest

# Check if server is running
curl http://localhost:8080/health
```
