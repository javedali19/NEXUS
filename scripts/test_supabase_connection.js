const https = require('https');

const url = 'https://ynxzcszosftypvfihrok.supabase.co/auth/v1/health';
const apiKey = 'sb_publishable_cl7-tINMQZ2NFhAW2GQy9Q_OfgAX1ki';

console.log('Testing connection to Supabase endpoint:', url);

const req = https.request(url, {
  method: 'GET',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json'
  }
}, (res) => {
  console.log(`Supabase Response Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Supabase Response Headers:', res.headers['content-type']);
    console.log('Supabase Connection Test Successful!');
  });
});

req.on('error', (err) => {
  console.error('Connection error:', err.message);
});

req.end();
