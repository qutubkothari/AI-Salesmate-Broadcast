# 🚀 WhatsApp Broadcast SaaS

Clean, focused multi-tenant WhatsApp broadcast system with two delivery modes.

## ✨ Features

- **Multi-tenant Architecture** - Each business gets isolated account
- **Dual Broadcast Modes**:
  - **Basic Plan**: Desktop Agent (free, requires computer running)
  - **Premium Plan**: Waha Cloud (24/7, cloud-based)
- **Simple Authentication** - JWT-based login/register
- **WhatsApp Web Integration** - QR code scanning for premium users
- **Broadcast Management** - Create, send, track broadcasts
- **No RLS Complexity** - Simple database queries

## 📋 Prerequisites

- Node.js 16+
- Supabase account
- Waha Cloud instance (for premium users)

## 🛠️ Setup Instructions

### 1. Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Open the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL to create all tables
5. Note your Supabase URL and anon key

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=your_random_secret_here
   WAHA_URL=http://43.205.192.171:3000
   WAHA_API_KEY=your_waha_api_key
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server runs on: `http://localhost:8080`

## 📁 Project Structure

```
whatsapp-broadcast-saas/
├── config/
│   └── database.js          # Supabase connection
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   ├── auth.js              # Login & register
│   ├── whatsapp.js          # Waha integration (premium)
│   ├── broadcast.js         # Broadcast management
│   └── desktopAgent.js      # Desktop agent queue (basic)
├── public/                   # Frontend files (to be created)
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
├── database-schema.sql      # Database setup
├── .env.example             # Environment template
├── package.json
└── server.js                # Main server

```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new tenant
- `POST /api/auth/login` - User login

### WhatsApp (Premium only)
- `POST /api/whatsapp/start-session` - Start Waha session
- `GET /api/whatsapp/qr` - Get QR code
- `GET /api/whatsapp/status` - Check connection status
- `POST /api/whatsapp/stop-session` - Disconnect

### Broadcasts
- `POST /api/broadcast/create` - Create broadcast
- `GET /api/broadcast/list` - List all broadcasts
- `GET /api/broadcast/:id` - Get broadcast details
- `POST /api/broadcast/:id/start` - Start sending

### Desktop Agent (Basic plan)
- `GET /api/desktop/queue/:tenantId` - Get pending messages
- `POST /api/desktop/update-status` - Update message status

## 🔐 Authentication

All API endpoints (except `/api/auth/*`) require JWT token in header:
```
Authorization: Bearer <token>
```

## 💾 Database Tables

- **tenants** - Business accounts
- **users** - Login credentials
- **contacts** - Customer phone numbers
- **broadcasts** - Broadcast campaigns
- **broadcast_recipients** - Individual messages

## 📱 Plans

### Basic Plan (Free)
- Uses Desktop Agent
- Requires computer running
- Local WhatsApp Web connection
- Perfect for small businesses

### Premium Plan
- Uses Waha Cloud (24/7)
- No computer needed
- Dedicated WhatsApp session
- Better for scale

## 🚀 Next Steps

1. Run the database schema in Supabase
2. Configure `.env` file
3. Install dependencies with `npm install`
4. Start server with `npm start`
5. Create frontend UI (login, register, dashboard)
6. Test registration and login
7. Test broadcast with basic plan (Desktop Agent)
8. Test broadcast with premium plan (Waha)

## 📞 Support

For issues or questions, contact: admin@saksolutions.ae
