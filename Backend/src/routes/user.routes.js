const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Function to send SMS
async function sendSmsToUser(mobile, otp) {
    const apiKey = process.env.SMS_API_KEY || "25FD9D1128C6C9";
    const senderId = process.env.SMS_SENDER_ID || "ENTITR";
    const message = `Your verification code is ${otp}. ${senderId}`;
    const contacts = `+91${mobile}`;
    const smsText = encodeURIComponent(message);

    const apiUrl = `https://sms.weblinto.com/smsapi/index?key=${apiKey}&campaign=0&routeid=6&type=text&contacts=${contacts}&senderid=${senderId}&msg=${smsText}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("SMS Sent:", data);
        return data;
    } catch (error) {
        console.error("Error sending SMS:", error);
        throw error;
    }
}

// Send OTP route
router.post("/send-otp", async (req, res) => {
    console.log("'/send-otp' API Called");
    const { username, mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ error: "Mobile number is required" });
    }

    const otp = generateOTP();

    try {
        const response = await sendSmsToUser(mobile, otp);

        // Check if user exists
        const checkUserQuery = "SELECT userID, username, contact FROM users WHERE contact = ?";
        db.query(checkUserQuery, [mobile], (err, result) => {
            if (err) {
                console.error("Error checking user:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (result.length > 0) {
                // Update existing user
                const updateQuery = `
                    UPDATE users 
                    SET username = ?, OTP = ?
                    WHERE contact = ?
                `;
                db.query(updateQuery, [username, otp, mobile], (err, updateResult) => {
                    if (err) {
                        console.error("Error updating user:", err);
                        return res.status(500).json({ error: "Failed to update OTP" });
                    }

                    const user = result[0];
                    res.status(200).json({
                        message: "OTP sent and user updated",
                        otp: otp,
                        userid: user.userID,
                        name: user.username,
                        mobile: user.contact,
                    });
                });
            } else {
                // Create new user
                const insertQuery = `
                    INSERT INTO users (username, contact, status, created_by, role, OTP)
                    VALUES (?, ?, 1, 'Self', 2, ?)
                `;
                db.query(insertQuery, [username, mobile, otp], (err, insertResult) => {
                    if (err) {
                        console.error("Error inserting user:", err);
                        return res.status(500).json({ error: "Failed to insert new user" });
                    }

                    res.status(200).json({
                        message: "OTP sent and new user created",
                        otp: otp,
                        userid: insertResult.insertId,
                        name: username,
                        mobile: mobile,
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

// Update complete status
router.post("/update-complete-status", (req, res) => {
    console.log("/update-complete-status API Called");
    const { userId, serviceId, confirmationStatus } = req.body;

    if (userId === undefined || serviceId === undefined || confirmationStatus === undefined) {
        return res.status(400).json({
            message: "userId, serviceId, and confirmationStatus are required",
        });
    }

    let newStatus;
    let messageOnCompleteStatus;

    if (confirmationStatus === "2") {
        newStatus = 2; // Completed
        messageOnCompleteStatus = 1;
    } else if (confirmationStatus === "3") {
        newStatus = 3; // Uncomplete/Closed
        messageOnCompleteStatus = 2;
    } else {
        return res.status(400).json({ message: "Invalid confirmationStatus" });
    }

    const query = `
        UPDATE service_request 
        SET status = ?, complete_status = ? 
        WHERE userID = ? AND service_id = ?
    `;

    db.query(query, [newStatus, messageOnCompleteStatus, userId, serviceId], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Status updated successfully",
                status: newStatus,
                complete_status: messageOnCompleteStatus,
            });
        } else {
            res.status(404).json({ message: "No matching record found" });
        }
    });
});

// Update service confirmation status
router.post("/confirmation-service-status", (req, res) => {
    console.log("'/confirmation-service-status' API Called");
    const { userId, serviceId, confirmationStatus } = req.body;

    if (userId === undefined || serviceId === undefined || confirmationStatus === undefined) {
        return res.status(400).json({
            message: "userId, serviceId, and confirmationStatus are required",
        });
    }

    let newStatus;
    if (confirmationStatus === 0) {
        newStatus = 5; // Uncomplete/Closed by user
    } else if (confirmationStatus === 1) {
        newStatus = 4; // In Progress
    } else {
        return res.status(400).json({ message: "Invalid confirmationStatus" });
    }

    const query = `
        UPDATE service_request 
        SET status = ? 
        WHERE userID = ? AND service_id = ?
    `;

    db.query(query, [newStatus, userId, serviceId], (error, result) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Status updated successfully",
                status: newStatus
            });
        } else {
            res.status(404).json({ message: "No matching record found" });
        }
    });
});

module.exports = router; 