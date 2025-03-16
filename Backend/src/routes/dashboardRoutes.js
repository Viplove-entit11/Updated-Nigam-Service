const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

// Dashboard routes
router.get('/dashboard-stats', verifyToken, getDashboardStats);
router.get('/monthly-stats', verifyToken, getMonthlyStats);

module.exports = router; 