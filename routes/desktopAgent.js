const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// ================================================
// DESKTOP AGENT: GET QUEUE (Messages to send)
// ================================================
router.get('/queue/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const apiKey = req.headers['x-api-key'];

        // Basic authentication (optional)
        if (apiKey && apiKey !== process.env.DESKTOP_AGENT_API_KEY) {
            return res.status(401).json({ ok: false, error: 'Invalid API key' });
        }

        // Get pending broadcasts for this tenant
        const { data: broadcasts, error } = await supabase
            .from('broadcasts')
            .select('*, broadcast_recipients!inner(*)')
            .eq('tenant_id', tenantId)
            .eq('delivery_method', 'desktop')
            .eq('status', 'in_progress')
            .eq('broadcast_recipients.status', 'pending')
            .limit(50); // Send 50 at a time

        if (error) throw error;

        // Flatten to list of messages
        const messages = [];
        for (const broadcast of broadcasts || []) {
            for (const recipient of broadcast.broadcast_recipients) {
                if (recipient.status === 'pending') {
                    messages.push({
                        id: recipient.id,
                        broadcastId: broadcast.id,
                        phone: recipient.phone,
                        name: recipient.name,
                        message: broadcast.message,
                        mediaUrl: broadcast.media_url
                    });
                }
            }
        }

        res.json({ ok: true, messages, count: messages.length });

    } catch (error) {
        console.error('Queue fetch error:', error);
        res.status(500).json({ ok: false, error: 'Failed to fetch queue' });
    }
});

// ================================================
// DESKTOP AGENT: UPDATE MESSAGE STATUS
// ================================================
router.post('/update-status', async (req, res) => {
    try {
        const { recipientId, status, errorMessage } = req.body;

        if (!recipientId || !status) {
            return res.status(400).json({ ok: false, error: 'Missing required fields' });
        }

        // Update recipient status
        const updateData = { 
            status,
            sent_at: status === 'sent' ? new Date().toISOString() : null,
            error_message: errorMessage || null
        };

        const { error } = await supabase
            .from('broadcast_recipients')
            .update(updateData)
            .eq('id', recipientId);

        if (error) throw error;

        // Get broadcast to update counts
        const { data: recipient } = await supabase
            .from('broadcast_recipients')
            .select('broadcast_id')
            .eq('id', recipientId)
            .single();

        if (recipient) {
            // Update broadcast counts
            const { data: broadcast } = await supabase
                .from('broadcasts')
                .select('sent_count, failed_count, total_recipients')
                .eq('id', recipient.broadcast_id)
                .single();

            if (broadcast) {
                const updates = {};
                if (status === 'sent') {
                    updates.sent_count = broadcast.sent_count + 1;
                } else if (status === 'failed') {
                    updates.failed_count = broadcast.failed_count + 1;
                }

                // Check if completed
                const totalProcessed = (updates.sent_count || broadcast.sent_count) + 
                                      (updates.failed_count || broadcast.failed_count);
                
                if (totalProcessed >= broadcast.total_recipients) {
                    updates.status = 'completed';
                    updates.completed_at = new Date().toISOString();
                }

                await supabase
                    .from('broadcasts')
                    .update(updates)
                    .eq('id', recipient.broadcast_id);
            }
        }

        res.json({ ok: true });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ ok: false, error: 'Failed to update status' });
    }
});

module.exports = router;
