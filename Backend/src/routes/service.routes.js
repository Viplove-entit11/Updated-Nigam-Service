const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Create service request
router.post("/service-request", (req, res) => {
    console.log("'/service-request' API Called");
    const {
        userId,
        description,
        street_address,
        city,
        state,
        country,
        pincode
    } = req.body;

    if (!userId || !description || !street_address || !city || !state || !country || !pincode) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = `
        INSERT INTO service_request 
            (userId, service_description, street_address, city, state, country, pincode) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [userId, description, street_address, city, state, country, pincode],
        (error, results) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({
                    message: "Database error",
                    error
                });
            }

            return res.status(201).json({
                message: "Service request created",
                requestId: results.insertId
            });
        }
    );
});

// Get all service requests
router.get("/get-requests", (req, res) => {
    console.log("'/get-requests' API Called");
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM service_request";
    const dataQuery = `
        SELECT sr.*, u.username 
        FROM service_request sr
        LEFT JOIN users u ON sr.userID = u.userID
        LIMIT ? OFFSET ?
    `;

    db.query(countQuery, (countError, countResult) => {
        if (countError) {
            console.error("Database Error:", countError);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        const totalCount = countResult[0].total;

        db.query(dataQuery, [parseInt(limit), parseInt(offset)], (error, result) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }

            return res.status(200).json({
                success: true,
                data: result,
                totalCount: totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
            });
        });
    });
});

// Get confirmed requests
router.get("/get-confirm-request", (req, res) => {
    console.log("'/get-confirm-request' API Called");
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM service_request WHERE status = 2";
    const dataQuery = `
        SELECT sr.*, u.username 
        FROM service_request sr
        LEFT JOIN users u ON sr.userID = u.userID
        WHERE sr.status = 2 
        LIMIT ? OFFSET ?
    `;

    db.query(countQuery, (countError, countResult) => {
        if (countError) {
            console.error("Database Error:", countError);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        const totalCount = countResult[0].total;

        db.query(dataQuery, [parseInt(limit), parseInt(offset)], (error, result) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }

            return res.status(200).json({
                success: true,
                data: result,
                totalCount: totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
            });
        });
    });
});

// Get closed requests
router.get("/get-closed-request", (req, res) => {
    console.log("'/get-closed-request' API Called");
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM service_request WHERE status = 3";
    const dataQuery = `
        SELECT sr.*, u.username 
        FROM service_request sr
        LEFT JOIN users u ON sr.userID = u.userID
        WHERE sr.status = 3 
        LIMIT ? OFFSET ?
    `;

    db.query(countQuery, (countError, countResult) => {
        if (countError) {
            console.error("Database Error:", countError);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        const totalCount = countResult[0].total;

        db.query(dataQuery, [parseInt(limit), parseInt(offset)], (error, result) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }

            return res.status(200).json({
                success: true,
                data: result,
                totalCount: totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
            });
        });
    });
});

// Get pending services
router.get("/pending-services", (req, res) => {
    console.log("'/pending-services' API Called");
    const query = `
        SELECT 
            sr.service_id,
            sr.service_description,
            u.username,
            u.contact,
            sr.location,
            sr.created_at,
            sr.status
        FROM service_request sr
        JOIN users u ON sr.userID = u.userID
        WHERE sr.status = 0
        ORDER BY sr.created_at DESC
        LIMIT 5
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    });
});

// Update service status
router.post("/service_status_update", (req, res) => {
    console.log("'/service_status_update' API Called");
    const { service_id, status, vendor_name } = req.body;

    if (!service_id || status === undefined || !vendor_name) {
        return res.status(400).json({ message: "Service ID, status, and vendor name are required." });
    }

    const query = "UPDATE service_request SET status = ?, vendor_alloted = ? WHERE service_id = ?";

    db.query(query, [status, vendor_name, service_id], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Service request not found." });
        }

        res.json({
            message: "Service status and vendor updated successfully.",
        });
    });
});

// Get user services
router.post("/get-userid-services", (req, res) => {
    console.log("'/get-userid-services' API Called");
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // const query = "SELECT * FROM service_request WHERE userID = ?";
    const query = "SELECT * FROM service_request WHERE userID = ? ORDER BY created_at DESC";

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error fetching services:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.json({
                message: "No services found for this user",
                services: [],
            });
        }

        res.json({ services: results });
    });
});

module.exports = router; 