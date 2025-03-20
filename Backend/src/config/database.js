const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables directly
dotenv.config();

// For debugging
console.log('Database config:', {
  host: process.env.DB_HOST || 'not set',
  user: process.env.DB_USER || 'not set',
  password: process.env.DB_PASSWORD ? '******' : 'not set',
  database: process.env.DB_NAME || 'not set'
});

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '', // Use empty string if password is not set
  database: process.env.DB_NAME,
});

// Establish connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database successfully.');
});

// Export the database connection
module.exports = db;
