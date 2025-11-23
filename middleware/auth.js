const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

// Verify JWT token and attach user/tenant to request
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ ok: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user and tenant
        const { data: user, error } = await supabase
            .from('users')
            .select('*, tenants(*)')
            .eq('id', decoded.userId)
            .eq('is_active', true)
            .single();

        if (error || !user) {
            return res.status(401).json({ ok: false, error: 'Invalid token' });
        }

        req.user = user;
        req.tenant = user.tenants;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ ok: false, error: 'Authentication failed' });
    }
};

module.exports = { authenticate };
