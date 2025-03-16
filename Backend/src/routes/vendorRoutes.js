const express = require('express');
const router = express.Router();
const { getAllVendors, deleteVendor, updateVendorStatus } = require('../controllers/vendorController');
const { verifyToken } = require('../middleware/auth');

// Vendor routes
router.get('/vendors_data', verifyToken, getAllVendors);
router.delete('/delete_vendor/:id', verifyToken, deleteVendor);
router.post('/update_vendor_status', verifyToken, updateVendorStatus);

module.exports = router; 