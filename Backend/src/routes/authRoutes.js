const express = require('express');
const router = express.Router();
const { login, logout, verifyAuth } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Auth routes
router.post('/admin-login', login);
router.post('/admin-logout', logout);
router.get('/verify-auth', verifyToken, verifyAuth);

module.exports = router; 