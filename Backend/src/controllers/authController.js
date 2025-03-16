const jwt = require('jsonwebtoken');
const db = require('../config/database');

const login = (req, res) => {
    console.log("Login endpoint called");
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
};

const logout = (req, res) => {
    console.log("Logout endpoint called");
    res.clearCookie('adminToken');
    res.json({ success: true, message: 'Logged out successfully' });
};

const verifyAuth = (req, res) => {
    console.log("Verify auth endpoint called");
    // Since we're using the verifyToken middleware, if we reach here, the token is valid
    res.json({
        email: req.user.email,
        success: true
    });
};

module.exports = {
    login,
    logout,
    verifyAuth
}; 