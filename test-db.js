require('dotenv').config();
const { supabase } = require('./config/database');

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Key:', process.env.SUPABASE_KEY);
    
    const { data, error } = await supabase
        .from('tenants')
        .select('count')
        .limit(1);
    
    if (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        process.exit(1);
    } else {
        console.log('✅ Connected to Supabase successfully!');
        console.log('Data:', data);
        process.exit(0);
    }
}

testConnection();
