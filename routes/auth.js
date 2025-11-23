const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

// ================================================
// REGISTER NEW TENANT + USER
// ================================================
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, businessName, whatsappPhone, plan } = req.body;

        if (!email || !password || !businessName) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Email, password, and business name are required' 
            });
        }

        // Check if email already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return res.status(400).json({ ok: false, error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                business_name: businessName,
                whatsapp_phone: whatsappPhone,
                plan: plan || 'basic'
            })
            .select()
            .single();

        if (tenantError) throw tenantError;

        // Create user
        const { data: user, error: userError } = await supabase
            .from('users')
            .insert({
                tenant_id: tenant.id,
                email,
                password_hash: passwordHash,
                full_name: fullName
            })
            .select()
            .single();

        if (userError) throw userError;

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, tenantId: tenant.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            ok: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                tenant: {
                    id: tenant.id,
                    businessName: tenant.business_name,
                    plan: tenant.plan
                }
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ ok: false, error: 'Registration failed' });
    }
});

// ================================================
// LOGIN
// ================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, error: 'Email and password required' });
        }

        // Fetch user with tenant
        const { data: user, error } = await supabase
            .from('users')
            .select('*, tenants(*)')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (error || !user) {
            return res.status(401).json({ ok: false, error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ ok: false, error: 'Invalid credentials' });
        }

        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            ok: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                tenant: {
                    id: user.tenants.id,
                    businessName: user.tenants.business_name,
                    whatsappPhone: user.tenants.whatsapp_phone,
                    plan: user.tenants.plan,
                    wahaStatus: user.tenants.waha_status
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ ok: false, error: 'Login failed' });
    }
});

module.exports = router;
