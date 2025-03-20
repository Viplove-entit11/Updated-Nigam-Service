const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all vendors data
router.get("/vendors_data", (req, res) => {
    console.log("'/vendors_data' API Called");
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
});

// Register new vendor
router.post("/register_vendor", (req, res) => {
    console.log("'/register_vendor' API Called");
    const { vendor_name, vendorCharges, vendorContact } = req.body;

    if (!vendor_name || !vendorCharges || !vendorContact) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const checkQuery = `SELECT * FROM vendors WHERE contact_number = ?`;
    db.query(checkQuery, [vendorContact], (err, result) => {
        if (err) {
            console.error("Error checking vendor:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result.length > 0) {
            return res.status(409).json({ message: "Vendor with this contact already exists" });
        }

        const insertQuery = `
            INSERT INTO vendors (name, contact_number, charges, status) 
            VALUES (?, ?, ?, 1)
        `;
        
        db.query(insertQuery, [vendor_name, vendorContact, vendorCharges], (err, result) => {
            if (err) {
                console.error("Error registering vendor:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            res.status(201).json({
                message: "Vendor registered successfully",
                vendorId: result.insertId,
            });
        });
    });
});

// Delete vendor
router.delete("/delete_vendor/:id", (req, res) => {
    console.log("'/delete_vendor/:id' API Called");
    const vendorId = req.params.id;

    db.query("SELECT * FROM vendors WHERE id = ?", [vendorId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching vendor", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        db.query("DELETE FROM vendors WHERE id = ?", [vendorId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error deleting vendor", error: err });
            }
            return res.status(200).json({ message: "Vendor deleted successfully" });
        });
    });
});

// Update vendor status
router.post("/update_vendor_status", (req, res) => {
    console.log("'/update_vendor_status' API Called");
    const { vendorId, status } = req.body;

    if (!vendorId || status === undefined) {
        return res.status(400).json({ message: "Vendor ID and status are required." });
    }

    const query = "UPDATE vendors SET status = ? WHERE id = ?";
    db.query(query, [status, vendorId], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.json({
            success: true,
            message: "Vendor status updated successfully"
        });
    });
});

// Get vendor names
router.get("/fetch_vendors_name", (req, res) => {
    console.log("'/fetch_vendors_name' API Called");
    const query = "SELECT name FROM vendors WHERE status = 1";

    db.query(query, (error, result) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    });
});

module.exports = router; 