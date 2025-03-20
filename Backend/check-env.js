const dotenv = require('dotenv');
const path = require('path');

// Try to load environment variables
dotenv.config();

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'not set');
console.log('DB_USER:', process.env.DB_USER || 'not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'set (hidden)' : 'not set');
console.log('DB_NAME:', process.env.DB_NAME || 'not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set (hidden)' : 'not set');
console.log('PORT:', process.env.PORT || 'not set');
