require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// ================================================
// MIDDLEWARE
// ================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ================================================
// ROUTES
// ================================================
const authRoutes = require('./routes/auth');
const whatsappRoutes = require('./routes/whatsapp');
const broadcastRoutes = require('./routes/broadcast');
const desktopAgentRoutes = require('./routes/desktopAgent');

app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/desktop', desktopAgentRoutes);

// ================================================
// HEALTH CHECK
// ================================================
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'WhatsApp Broadcast SaaS'
    });
});

// ================================================
// SERVE FRONTEND
// ================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ================================================
// ERROR HANDLING
// ================================================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        ok: false, 
        error: err.message || 'Internal server error' 
    });
});

// ================================================
// START SERVER
// ================================================
app.listen(PORT, () => {
    console.log('================================================');
    console.log('  WhatsApp Broadcast SaaS');
    console.log('================================================');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Access: http://localhost:${PORT}`);
    console.log('================================================');
});
