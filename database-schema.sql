-- ================================================
-- WhatsApp Broadcast SaaS - Fresh Database Schema
-- ================================================
-- Run this in Supabase SQL Editor
-- IMPORTANT: RLS is DISABLED for simplicity

-- Clean slate: Drop existing tables if any
DROP TABLE IF EXISTS broadcast_recipients CASCADE;
DROP TABLE IF EXISTS broadcasts CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- ================================================
-- 1. TENANTS TABLE
-- ================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    whatsapp_phone VARCHAR(20), -- Their WhatsApp number
    plan VARCHAR(20) DEFAULT 'basic', -- 'basic' or 'premium'
    waha_session_name VARCHAR(100), -- For premium users
    waha_status VARCHAR(50), -- 'disconnected', 'connecting', 'connected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. USERS TABLE (Login credentials)
-- ================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- ================================================
-- 3. CONTACTS TABLE
-- ================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    tags TEXT[], -- For grouping/filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 4. BROADCASTS TABLE
-- ================================================
CREATE TABLE broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT NOT NULL,
    media_url TEXT, -- Optional image/video URL
    delivery_method VARCHAR(20), -- 'desktop' or 'waha'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ================================================
-- 5. BROADCAST RECIPIENTS TABLE
-- ================================================
CREATE TABLE broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered', 'read'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES for Performance
-- ================================================
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_broadcasts_tenant ON broadcasts(tenant_id);
CREATE INDEX idx_broadcast_recipients_broadcast ON broadcast_recipients(broadcast_id);
CREATE INDEX idx_broadcast_recipients_status ON broadcast_recipients(status);

-- ================================================
-- DISABLE RLS (Row Level Security) - Keep it simple!
-- ================================================
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients DISABLE ROW LEVEL SECURITY;

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================
-- Insert a test tenant
INSERT INTO tenants (id, business_name, whatsapp_phone, plan) 
VALUES (
    'c93fbde0-7d5d-473c-ab2b-5f677c9a495c',
    'SAK Solutions',
    '971507055253',
    'premium'
);

-- Insert a test user (password: Test123!)
-- Password hash generated with bcrypt
INSERT INTO users (tenant_id, email, password_hash, full_name)
VALUES (
    'c93fbde0-7d5d-473c-ab2b-5f677c9a495c',
    'admin@saksolutions.ae',
    '$2b$10$YourHashHere', -- You'll need to generate this
    'SAK Admin'
);

-- ================================================
-- DONE! ✅
-- ================================================
-- Next steps:
-- 1. Copy this SQL to Supabase SQL Editor
-- 2. Run it to create all tables
-- 3. Note down your Supabase URL and anon key
-- 4. Update the Node.js app with these credentials
