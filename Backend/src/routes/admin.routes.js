const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify auth endpoint
router.get("/verify-auth", (req, res) => {
    console.log("'/verify-auth' API Called");
    try {
        const token = req.cookies.adminToken;
        
        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Send back the user info
        res.json({
            email: decoded.email,
            success: true
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Admin login route
router.post("/admin-login", (req, res) => {
    console.log("'/admin-login' API Called");
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const query = "SELECT * FROM admin WHERE email_address = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: results[0].id,
                email: results[0].email_address 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set HTTP-only cookie
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({ 
            message: "Login successful",
            adminId: results[0].id
        });
    });
});

// Add logout endpoint
router.post("/admin-logout", (req, res) => {
    console.log("'/admin-logout' API Called");
    res.clearCookie('adminToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

// API route for dashboard data
router.get("/dashboard-stats", (req, res) => {
    console.log("'/dashboard-stats' API Called");

    const query = `
        SELECT 
            (SELECT COUNT(*) FROM vendors WHERE status = 1) AS total_active_vendors,
            (SELECT COUNT(*) FROM service_request) AS total_requests,
            (SELECT COUNT(*) FROM service_request WHERE status = 2) AS confirmed_requests,
            (SELECT COUNT(*) FROM service_request WHERE status = 3) AS closed_requests
    `;

    db.query(query, (error, result) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
        return res.status(200).json({ success: true, data: result[0] });
    });
});

// New endpoint for monthly request statistics
router.get("/monthly-stats", (req, res) => {
    console.log("'/monthly-stats' API Called");

    const query = `
        SELECT 
            DATE_FORMAT(created_at, '%b') as month,
            COUNT(*) as requests,
            MONTH(created_at) as month_number
        FROM service_request
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
        GROUP BY month, month_number
        ORDER BY month_number;
    `;

    db.query(query, (error, result) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Internal server error" 
            });
        }

        // Fill in missing months with zero requests
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map(month => {
            const found = result.find(r => r.month === month);
            return {
                month: month,
                requests: found ? found.requests : 0
            };
        });

        return res.status(200).json({ 
            success: true, 
            data: monthlyData 
        });
    });
});

module.exports = router; 