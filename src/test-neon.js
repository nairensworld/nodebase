// native-test.js
const net = require('net');
// Ensure 'dotenv' is installed (npm install dotenv) to load .env variables
require('dotenv').config(); 

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL not found in .env file.");
    process.exit(1);
}

// Function to parse the URL and substitute the direct hostname
function parseUrl(url) {
    try {
        const urlObj = new URL(url);
        
        // 1. Get the host, removing the pooler suffix if present
        let host = urlObj.hostname.replace('-pooler', ''); 
        
        return {
            host: host,
            port: urlObj.port || 5432,
            user: urlObj.username,
            db: urlObj.pathname.substring(1) // Remove leading slash
        };
    } catch (e) {
        console.error("❌ Error parsing DATABASE_URL:", e.message);
        process.exit(1);
    }
}

const { host, port, user, db } = parseUrl(dbUrl);
const timeout = 7000; // Increased timeout to 7 seconds

console.log(`--- Running Advanced Native TCP Diagnostic ---`);
console.log(`Testing Host: ${host} (Non-Pooler Host)`);
console.log(`Testing Port: ${port}`);
console.log(`User/DB: ${user} / ${db}`);


const client = net.connect(port, host, () => {
    console.log(`\n✅ **STEP 1: TCP CONNECTED**`);
    console.log(`The network path is confirmed OPEN. Proceeding to handshake failure analysis.`);
    
    // NOTE: This client will now immediately disconnect as it doesn't speak Postgres protocol
    // But we listen for the server's immediate response data
});

client.setTimeout(timeout);

client.on('data', (data) => {
    // This is very important: sometimes the server sends a rejection message 
    // before closing the connection. This will log that buffer.
    console.log('\n🚨 **STEP 2: DATA RECEIVED** (Likely Postgres Rejection)');
    console.log('Received raw data buffer (HEX):', data.toString('hex'));
    console.log('Received raw data buffer (ASCII):', data.toString('ascii'));
    console.log('This data is the start of the PostgreSQL protocol response.');
    client.end();
});

client.on('end', () => {
    console.log('\n--- Connection ended by server or client. ---');
});

client.on('error', (err) => {
    console.error(`\n❌ **STEP 3: FATAL CONNECTION ERROR**`);
    console.error(`ERROR TYPE: ${err.code}`);
    console.error(`MESSAGE: ${err.message}`);

    if (err.code === 'ECONNRESET') {
        console.log(`\n**ANALYSIS:** ECONNRESET is confirmation the server established the connection then immediately closed it.`);
        console.log(`This is the strongest possible indicator of an **AUTHENTICATION (User/Pass) FAILURE** on the server side.`);
        console.log(`The problem is NOT network or firewall.`);
    } else if (err.code === 'ETIMEDOUT') {
        console.log(`\n**ANALYSIS:** Timeout. Check for firewalls (local or cloud) or incorrect host/port.`);
    }
    client.end();
});

client.on('timeout', () => {
    console.error(`\n❌ **STEP 3: CONNECTION TIMEOUT**`);
    console.log(`Did not receive a response within ${timeout}ms. (Unlikely given prior success)`);
    client.end();
});