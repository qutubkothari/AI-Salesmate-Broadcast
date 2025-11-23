const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { supabase } = require('../config/database');

const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY;

// ================================================
// CREATE BROADCAST
// ================================================
router.post('/create', authenticate, async (req, res) => {
    try {
        const { title, message, recipients, mediaUrl } = req.body;

        if (!message || !recipients || recipients.length === 0) {
            return res.status(400).json({ 
                ok: false, 
                error: 'Message and recipients required' 
            });
        }

        // Determine delivery method based on plan
        const deliveryMethod = req.tenant.plan === 'premium' ? 'waha' : 'desktop';

        // Create broadcast
        const { data: broadcast, error } = await supabase
            .from('broadcasts')
            .insert({
                tenant_id: req.tenant.id,
                title,
                message,
                media_url: mediaUrl,
                delivery_method: deliveryMethod,
                total_recipients: recipients.length
            })
            .select()
            .single();

        if (error) throw error;

        // Create recipient records
        const recipientRecords = recipients.map(r => ({
            broadcast_id: broadcast.id,
            phone: r.phone,
            name: r.name || null
        }));

        const { error: recipientsError } = await supabase
            .from('broadcast_recipients')
            .insert(recipientRecords);

        if (recipientsError) throw recipientsError;

        res.json({ ok: true, broadcast });

    } catch (error) {
        console.error('Create broadcast error:', error);
        res.status(500).json({ ok: false, error: 'Failed to create broadcast' });
    }
});

// ================================================
// GET BROADCASTS LIST
// ================================================
router.get('/list', authenticate, async (req, res) => {
    try {
        const { data: broadcasts, error } = await supabase
            .from('broadcasts')
            .select('*')
            .eq('tenant_id', req.tenant.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ ok: true, broadcasts });

    } catch (error) {
        console.error('List broadcasts error:', error);
        res.status(500).json({ ok: false, error: 'Failed to fetch broadcasts' });
    }
});

// ================================================
// GET BROADCAST DETAILS
// ================================================
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: broadcast, error } = await supabase
            .from('broadcasts')
            .select('*, broadcast_recipients(*)')
            .eq('id', id)
            .eq('tenant_id', req.tenant.id)
            .single();

        if (error) throw error;

        res.json({ ok: true, broadcast });

    } catch (error) {
        console.error('Get broadcast error:', error);
        res.status(500).json({ ok: false, error: 'Broadcast not found' });
    }
});

// ================================================
// START BROADCAST (Queue for sending)
// ================================================
router.post('/:id/start', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Get broadcast with recipients
        const { data: broadcast, error } = await supabase
            .from('broadcasts')
            .select('*, broadcast_recipients(*)')
            .eq('id', id)
            .eq('tenant_id', req.tenant.id)
            .single();

        if (error || !broadcast) {
            return res.status(404).json({ ok: false, error: 'Broadcast not found' });
        }

        // Update broadcast status
        await supabase
            .from('broadcasts')
            .update({ 
                status: 'in_progress',
                started_at: new Date().toISOString()
            })
            .eq('id', id);

        // Send based on delivery method
        if (broadcast.delivery_method === 'waha') {
            // Premium: Send via Waha immediately
            sendViaWaha(broadcast, req.tenant);
        } else {
            // Basic: Queue for Desktop Agent
            // Desktop agent will poll /api/desktop/queue endpoint
        }

        res.json({ ok: true, message: 'Broadcast started' });

    } catch (error) {
        console.error('Start broadcast error:', error);
        res.status(500).json({ ok: false, error: 'Failed to start broadcast' });
    }
});

// ================================================
// SEND VIA WAHA (Premium)
// ================================================
async function sendViaWaha(broadcast, tenant) {
    const sessionName = tenant.waha_session_name;
    
    for (const recipient of broadcast.broadcast_recipients) {
        try {
            const chatId = recipient.phone.includes('@') ? recipient.phone : `${recipient.phone}@c.us`;

            await axios.post(
                `${WAHA_URL}/api/sendText`,
                {
                    session: sessionName,
                    chatId,
                    text: broadcast.message
                },
                { headers: { 'X-Api-Key': WAHA_API_KEY } }
            );

            // Update recipient status
            await supabase
                .from('broadcast_recipients')
                .update({ 
                    status: 'sent',
                    sent_at: new Date().toISOString()
                })
                .eq('id', recipient.id);

            // Update broadcast sent count
            await supabase
                .from('broadcasts')
                .update({ sent_count: broadcast.sent_count + 1 })
                .eq('id', broadcast.id);

            // Rate limiting: wait 2 seconds between messages
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`Failed to send to ${recipient.phone}:`, error.message);
            
            await supabase
                .from('broadcast_recipients')
                .update({ 
                    status: 'failed',
                    error_message: error.message
                })
                .eq('id', recipient.id);

            await supabase
                .from('broadcasts')
                .update({ failed_count: broadcast.failed_count + 1 })
                .eq('id', broadcast.id);
        }
    }

    // Mark broadcast as completed
    await supabase
        .from('broadcasts')
        .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', broadcast.id);
}

module.exports = router;
