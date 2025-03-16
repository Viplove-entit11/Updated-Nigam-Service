const db = require('../config/database');

const getDashboardStats = (req, res) => {
    console.log("Dashboard stats endpoint called");

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
};

const getMonthlyStats = (req, res) => {
    console.log("Monthly stats endpoint called");

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
};

module.exports = {
    getDashboardStats,
    getMonthlyStats
}; 