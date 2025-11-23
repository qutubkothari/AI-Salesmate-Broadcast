const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { supabase } = require('../config/database');

const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY;

// ================================================
// START WAHA SESSION (Premium only)
// ================================================
router.post('/start-session', authenticate, async (req, res) => {
    try {
        if (req.tenant.plan !== 'premium') {
            return res.status(403).json({ 
                ok: false, 
                error: 'Premium plan required for cloud WhatsApp' 
            });
        }

        const sessionName = `tenant_${req.tenant.id}`;

        // Start session in Waha
        const response = await axios.post(
            `${WAHA_URL}/api/sessions/start`,
            { name: sessionName },
            { headers: { 'X-Api-Key': WAHA_API_KEY } }
        );

        // Update tenant
        await supabase
            .from('tenants')
            .update({
                waha_session_name: sessionName,
                waha_status: 'connecting'
            })
            .eq('id', req.tenant.id);

        res.json({ ok: true, session: sessionName, status: 'connecting' });

    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ ok: false, error: 'Failed to start WhatsApp session' });
    }
});

// ================================================
// GET QR CODE (Premium only)
// ================================================
router.get('/qr', authenticate, async (req, res) => {
    try {
        if (req.tenant.plan !== 'premium') {
            return res.status(403).json({ ok: false, error: 'Premium plan required' });
        }

        if (!req.tenant.waha_session_name) {
            return res.status(400).json({ ok: false, error: 'No session started' });
        }

        const response = await axios.get(
            `${WAHA_URL}/api/sessions/${req.tenant.waha_session_name}/qr`,
            { headers: { 'X-Api-Key': WAHA_API_KEY } }
        );

        res.json({ ok: true, qr: response.data });

    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ ok: false, error: 'QR code not available yet' });
        }
        console.error('QR code error:', error);
        res.status(500).json({ ok: false, error: 'Failed to get QR code' });
    }
});

// ================================================
// GET SESSION STATUS (Premium only)
// ================================================
router.get('/status', authenticate, async (req, res) => {
    try {
        if (req.tenant.plan !== 'premium') {
            return res.json({ 
                ok: true, 
                status: 'not_available', 
                plan: 'basic',
                message: 'Upgrade to premium for cloud WhatsApp'
            });
        }

        if (!req.tenant.waha_session_name) {
            return res.json({ ok: true, status: 'disconnected' });
        }

        const response = await axios.get(
            `${WAHA_URL}/api/sessions/${req.tenant.waha_session_name}`,
            { headers: { 'X-Api-Key': WAHA_API_KEY } }
        );

        const status = response.data.status;

        // Update tenant status
        await supabase
            .from('tenants')
            .update({ waha_status: status })
            .eq('id', req.tenant.id);

        res.json({ ok: true, status, data: response.data });

    } catch (error) {
        console.error('Status check error:', error);
        res.json({ ok: true, status: 'disconnected' });
    }
});

// ================================================
// STOP SESSION (Premium only)
// ================================================
router.post('/stop-session', authenticate, async (req, res) => {
    try {
        if (!req.tenant.waha_session_name) {
            return res.status(400).json({ ok: false, error: 'No active session' });
        }

        await axios.post(
            `${WAHA_URL}/api/sessions/${req.tenant.waha_session_name}/stop`,
            {},
            { headers: { 'X-Api-Key': WAHA_API_KEY } }
        );

        // Update tenant
        await supabase
            .from('tenants')
            .update({ waha_status: 'disconnected' })
            .eq('id', req.tenant.id);

        res.json({ ok: true, message: 'Session stopped' });

    } catch (error) {
        console.error('Stop session error:', error);
        res.status(500).json({ ok: false, error: 'Failed to stop session' });
    }
});

module.exports = router;
