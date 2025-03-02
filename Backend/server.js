const express = require('express')
const mysql= require('mysql')
const cors = require('cors')
const app = express()

app.use(cors("*"))
app.use(express.json());

// creating connection with database
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"nigam_service"
})
db.connect((err) => {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
    console.log('Connected to database.');
  });



  
/*
*
API Routes
*/

// default backend route
app.get('/',(request, response)=>{
    return response.json("From Backend")
})

// API route for dashboard data
app.get("/dashboard-stats", (req, res) => {
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

// endpoint to get vendors data from vendors table
app.get('/vendors_data', (request, response) => {
    const sql = 'SELECT * FROM vendors';
    db.query(sql, (err, data) => {
      if (err) {
        console.error('Error fetching vendors data:', err);
        return response.status(500).json({
          success: false,
          message: 'Internal Server Error',
          error: err,
        });
      }
  
      if (data.length > 0) {
        return response.status(200).json({
          success: true,
          message: 'Vendors data fetched successfully',
          vendors: data,
        });
      } else {
        return response.status(404).json({
          success: false,
          message: 'No vendors found',
        });
      }
    });
});

// function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);  // Generates a 4-digit OTP
}

// sending SMS to user 
async function sendSmsToUser(mobile, otp) {
    // console.log('API Key:', process.env.API_KEY); // <-- Check API Key
    const apiKey = "25FD9D1128C6C9";
    const senderId = "ENTITR";
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
        console.log('SMS Sent:', data);
        return data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

// API Route to Send OTP
app.post('/send-otp', async (req, res) => {
    const { username, mobile } = req.body;
    
    if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    const otp = generateOTP();
    
    try {
        const response = await sendSmsToUser(mobile, otp);

        // Check if the user with the given mobile number already exists
        const checkUserQuery = 'SELECT * FROM users WHERE contact = ?';
        db.query(checkUserQuery, [mobile], (err, result) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.length > 0) {
                // User exists, so update the OTP and username
                const updateQuery = `
                    UPDATE users 
                    SET username = ?, OTP = ?
                    WHERE contact = ?
                `;
                db.query(updateQuery, [username, otp, mobile], (err, updateResult) => {
                    if (err) {
                        console.error('Error updating user:', err);
                        return res.status(500).json({ error: 'Failed to update OTP' });
                    }

                    res.status(200).json({ message: 'OTP sent and user updated', otp: otp, response });
                });

            } else {
                // User does not exist, so insert a new record
                const insertQuery = `
                    INSERT INTO users (username, contact, status, created_by, role, OTP)
                    VALUES (?, ?, 1, 'Self', 2, ?)
                `;
                db.query(insertQuery, [username, mobile, otp], (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).json({ error: 'Failed to insert new user' });
                    }

                    res.status(200).json({ message: 'OTP sent and new user created', otp: otp, response });
                });
            }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// API Route for vendor registration.
app.post("/register_vendor", (request, response) => {
    // Extract Data from Payload
    const { vendor_name, vendorCharges, vendorContact } = request.body;

    // Input Validation
    if (!vendor_name || !vendorCharges || !vendorContact) {
        return response.status(400).json({ message: "All fields are required" });
    }
    // Input Validation
    if (!vendor_name || !vendorCharges || !vendorContact) {
        return response.status(400).json({ message: "All fields are required" });
    }

    // Check if Contact Number is Unique
    const checkQuery = `SELECT * FROM vendors WHERE contact_number = ?`;
    db.query(checkQuery, [vendorContact], (err, result) => {
        if (err) {
            console.error("Error checking vendor:", err);
            return response.status(500).json({ message: "Internal Server Error" });
        }

        if (result.length > 0) {
            return response.status(409).json({ message: "Vendor with this contact already exists" });
        }

        // Insert Vendor into Database (No service_type column)
        const insertQuery = `
            INSERT INTO vendors (name, contact_number, charges, status) 
            VALUES (?, ?, ?, 1)
        `;
        db.query(insertQuery, [vendor_name, vendorContact, vendorCharges], (err, result) => {
            if (err) {
                console.error("Error registering vendor:", err);
                return response.status(500).json({ message: "Internal Server Error" });
            }

            // Success Response
            response.status(201).json({ 
                message: "Vendor registered successfully", 
                vendorId: result.insertId 
            });
        });
    });
});

// api for service_request
app.post('/service-request', (req, res) => {
    const { userId, description, location } = req.body;
  
    // Validate the incoming data
    if (!userId || !description || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Insert the data into the service_request table
    const query = 'INSERT INTO service_request (userId, service_description, location) VALUES (?, ?, ?)';
    db.query(query, [userId, description, location], (error, results) => {

      if (error) {
        return res.status(500).json({ message: 'Database error', error });
      }
      res.status(201).json({ message: 'Service request created', requestId: results.insertId });
    });
  });

//   API for fetching all service requests
app.get('/get-requests', (request, response) => {
    const { page = 1, limit = 10 } = request.query; // Default: page 1, limit 10
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM service_request";
    const dataQuery = "SELECT * FROM service_request LIMIT ? OFFSET ?";

    db.query(countQuery, (countError, countResult) => {
        if (countError) {
            console.error('Database Error:', countError);
            return response.status(500).json({ success: false, message: 'Internal server error' });
        }

        const totalCount = countResult[0].total;

        db.query(dataQuery, [parseInt(limit), parseInt(offset)], (error, result) => {
            if (error) {
                console.error('Database Error:', error);
                return response.status(500).json({ success: false, message: 'Internal server error' });
            }

            return response.status(200).json({
                success: true,
                data: result,
                totalCount: totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit)
            });
        });
    });
});

// API route to update status of request based on confirmation Status=> agree (1) / disagree (0) of user (for mobile app)
app.post('/confirmation-service-status', (req, res) => {
    const { userId, serviceId, confirmationStatus } = req.body;

    // Validate request body
    if (userId === undefined || serviceId === undefined || confirmationStatus === undefined) {
        return res.status(400).json({ message: 'userId, serviceId, and confirmationStatus are required' });
    }

    // Determine the new status based on confirmationStatus
    let newStatus;
    if (confirmationStatus === 0) {
        newStatus = 3; // Uncomplete/Closed
    } else if (confirmationStatus === 1) {
        newStatus = 4; // In Progress
    } else {
        return res.status(400).json({ message: 'Invalid confirmationStatus' });
    }

    // Update the status in the service_request table
    const query = `
        UPDATE service_request 
        SET status = ? 
        WHERE userID = ? AND service_id = ?
    `;
    db.query(query, [newStatus, userId, serviceId], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Database error', error });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Status updated successfully', status: newStatus });
        } else {
            res.status(404).json({ message: 'No matching record found' });
        }
    });
});

// API Route to fetch vendors name
app.get('/fetch_vendors_name', (req, res) => {
    const query = "SELECT name FROM vendors WHERE status = 1";

    db.query(query, (error, result) => {
        if (error) {
            console.error('Database Error:', error);  // Log error for debugging
            return res.status(500).json({ message: 'Internal server error' }); // Generic error message
        }

        res.status(200).json({
            success: true,
            data: result
        });
    });
});

// API Route to updated service status
app.post('/service_status_update', (request, response) => {
    const { service_id, status, vendor_name } = request.body; // Extract service_id, status, and vendor_name

    if (!service_id || status === undefined || !vendor_name) {
        return response.status(400).json({ message: "Service ID, status, and vendor name are required." });
    }

    const query = "UPDATE service_request SET status = ?, vendor_alloted = ? WHERE service_id = ?";

    db.query(query, [status, vendor_name, service_id], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return response.status(500).json({ message: "Database error", error });
        }

        if (result.affectedRows === 0) {
            return response.status(404).json({ message: "Service request not found." });
        }

        response.json({ message: "Service status and vendor updated successfully." });
    });
});

// API Route for returning the confirm request
app.get('/get-confirm-request', (request, response) => {
    const { page = 1, limit = 10 } = request.query;  // Default: page 1, 10 items per page
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM service_request WHERE status = 2";
    const dataQuery = `SELECT * FROM service_request WHERE status = 2 LIMIT ? OFFSET ?`;

    db.query(countQuery, (countError, countResult) => {
        if (countError) {
            console.error('Database Error:', countError);
            return response.status(500).json({ success: false, message: 'Internal server error' });
        }

        const totalCount = countResult[0].total; // Total number of confirmed requests

        db.query(dataQuery, [parseInt(limit), parseInt(offset)], (error, result) => {
            if (error) {
                console.error('Database Error:', error);
                return response.status(500).json({ success: false, message: 'Internal server error' });
            }

            return response.status(200).json({
                success: true,
                data: result,
                totalCount: totalCount,  // Send total count for frontend pagination
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit)
            });
        });
    });
});

// API Route for returnig the closed request 
app.get('/get-closed-request', (request, response) => {
    const { page = 1, limit = 10 } = request.query;  // Default: page 1, 10 items per page
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM service_request WHERE status = 3";
    const dataQuery = `SELECT * FROM service_request WHERE status = 3 LIMIT ? OFFSET ?`;

    db.query(countQuery, (countError, countResult) => {
        if (countError) {
            console.error('Database Error:', countError);
            return response.status(500).json({ success: false, message: 'Internal server error' });
        }

        const totalCount = countResult[0].total; // Total number of confirmed requests

        db.query(dataQuery, [parseInt(limit), parseInt(offset)], (error, result) => {
            if (error) {
                console.error('Database Error:', error);
                return response.status(500).json({ success: false, message: 'Internal server error' });
            }

            return response.status(200).json({
                success: true,
                data: result,
                totalCount: totalCount,  // Send total count for frontend pagination
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit)
            });
        });
    });
});





// APP LISTENING TO PORT 8081
app.listen(8081,'0.0.0.0',()=>{
    console.log("listening")
})
