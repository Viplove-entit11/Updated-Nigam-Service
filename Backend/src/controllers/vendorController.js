const db = require('../config/database');

// Get all vendors
const getAllVendors = (req, res) => {
    console.log("Get vendors endpoint called");
    
    const sql = "SELECT * FROM vendors";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Error fetching vendors data:", err);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: err,
            });
        }

        if (data.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Vendors data fetched successfully",
                vendors: data,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No vendors found",
            });
        }
    });
};

// Delete vendor
const deleteVendor = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM vendors WHERE id = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting vendor:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete vendor",
                error: err
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }
        
        res.json({
            success: true,
            message: "Vendor deleted successfully"
        });
    });
};

// Update vendor status
const updateVendorStatus = (req, res) => {
    const { vendorId, status } = req.body;
    
    if (!vendorId || status === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vendor ID and status are required"
        });
    }
    
    const query = "UPDATE vendors SET status = ? WHERE id = ?";
    
    db.query(query, [status, vendorId], (err, result) => {
        if (err) {
            console.error("Error updating vendor status:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update vendor status",
                error: err
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }
        
        res.json({
            success: true,
            message: "Vendor status updated successfully"
        });
    });
};

module.exports = {
    getAllVendors,
    deleteVendor,
    updateVendorStatus
}; 