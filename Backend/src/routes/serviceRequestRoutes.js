const express = require('express');
const router = express.Router();
const { 
    getAllRequests, 
    getConfirmedRequests, 
    getClosedRequests, 
    updateRequestStatus 
} = require('../controllers/serviceRequestController');
const { verifyToken } = require('../middleware/auth');

// Service request routes
router.get('/get-requests', verifyToken, getAllRequests);
router.get('/get-confirm-request', verifyToken, getConfirmedRequests);
router.get('/get-closed-request', verifyToken, getClosedRequests);
router.post('/update-request-status', verifyToken, updateRequestStatus);

module.exports = router; 