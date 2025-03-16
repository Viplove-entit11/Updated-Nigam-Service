const db = require('../config/database');

// Get all service requests with pagination
const getAllRequests = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT sr.*, u.username 
        FROM service_request sr
        LEFT JOIN users u ON sr.userID = u.id
        ORDER BY sr.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const countQuery = "SELECT COUNT(*) as total FROM service_request";

    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error("Error counting requests:", err);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);

        db.query(query, [limit, offset], (err, data) => {
            if (err) {
                console.error("Error fetching requests:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }

            res.json({
                success: true,
                data: data,
                totalPages,
                currentPage: page,
                totalCount
            });
        });
    });
};

// Get confirmed requests with pagination
const getConfirmedRequests = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT sr.*, u.username 
        FROM service_request sr
        LEFT JOIN users u ON sr.userID = u.id
        WHERE sr.status = 2
        ORDER BY sr.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const countQuery = "SELECT COUNT(*) as total FROM service_request WHERE status = 2";

    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error("Error counting confirmed requests:", err);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);

        db.query(query, [limit, offset], (err, data) => {
            if (err) {
                console.error("Error fetching confirmed requests:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }

            res.json({
                success: true,
                data: data,
                totalPages,
                currentPage: page,
                totalCount
            });
        });
    });
};

// Get closed requests with pagination
const getClosedRequests = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT sr.*, u.username 
        FROM service_request sr
        LEFT JOIN users u ON sr.userID = u.id
        WHERE sr.status = 3
        ORDER BY sr.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const countQuery = "SELECT COUNT(*) as total FROM service_request WHERE status = 3";

    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error("Error counting closed requests:", err);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);

        db.query(query, [limit, offset], (err, data) => {
            if (err) {
                console.error("Error fetching closed requests:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }

            res.json({
                success: true,
                data: data,
                totalPages,
                currentPage: page,
                totalCount
            });
        });
    });
};

// Update service request status
const updateRequestStatus = (req, res) => {
    const { serviceId, status, userId } = req.body;

    if (!serviceId || !status || !userId) {
        return res.status(400).json({
            success: false,
            message: "Service ID, status, and user ID are required"
        });
    }

    const query = "UPDATE service_request SET status = ? WHERE service_id = ? AND userID = ?";

    db.query(query, [status, serviceId, userId], (err, result) => {
        if (err) {
            console.error("Error updating request status:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update request status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Service request not found"
            });
        }

        res.json({
            success: true,
            message: "Service request status updated successfully"
        });
    });
};

module.exports = {
    getAllRequests,
    getConfirmedRequests,
    getClosedRequests,
    updateRequestStatus
}; 