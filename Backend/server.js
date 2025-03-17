const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// enabling dotenv
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Update CORS configuration to allow both development ports
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Allow both ports
    // origin: ['http://192.168.2.28:3000',],// Use this when running on network and change the frontend port to 3000
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// for parsing data
app.use(cookieParser());
app.use(express.json());

// creating connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// checking for connection eshtablishment
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

/*
*
API Routes
*/

// default backend route
app.get("/", (request, response) => {
    console.log("'/' API Called");
  return response.json("Coming From Backend");
});

// Verify auth endpoint
app.get("/verify-auth", (req, res) => {
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

// API Route for admin login
app.post("/admin-login", (req, res) => {
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
app.post("/admin-logout", (req, res) => {
    console.log("'/admin-logout' API Called");
    res.clearCookie('adminToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

// API route for dashboard data
app.get("/dashboard-stats", (req, res) => {
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
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    return res.status(200).json({ success: true, data: result[0] });
  });
});

// New endpoint for monthly request statistics
app.get("/monthly-stats", (req, res) => {
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

// endpoint to get vendors data from vendors table
app.get("/vendors_data", (request, response) => {
    console.log("'/vendors_data' API Called");
    console.log("Request received:", request.body); // Log incoming request data


  const sql = "SELECT * FROM vendors";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching vendors data:", err);
      return response.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err,
      });
    }

    if (data.length > 0) {
      return response.status(200).json({
        success: true,
        message: "Vendors data fetched successfully",
        vendors: data,
      });
    } else {
      return response.status(404).json({
        success: false,
        message: "No vendors found",
      });
    }
  });
});

// function to generate OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
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
    console.log("SMS Sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

app.post("/send-otp", async (req, res) => {
    console.log("'/send-otp' API Called");
    console.log("Request received:", req.body); // Log incoming request data


  const { username, mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }

  const otp = generateOTP();

  try {
    const response = await sendSmsToUser(mobile, otp);

    // Check if the user with the given mobile number already exists
    const checkUserQuery =
      "SELECT userID, username, contact FROM users WHERE contact = ?";
    db.query(checkUserQuery, [mobile], (err, result) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ error: "Database error" });
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
        // User does not exist, so insert a new record
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

// API Route for vendor registration.
app.post("/register_vendor", (request, response) => {
    console.log("'/register_vendor' API Called");

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
      return response
        .status(409)
        .json({ message: "Vendor with this contact already exists" });
    }

    // Insert Vendor into Database (No service_type column)
    const insertQuery = `
            INSERT INTO vendors (name, contact_number, charges, status) 
            VALUES (?, ?, ?, 1)
        `;
    db.query(
      insertQuery,
      [vendor_name, vendorContact, vendorCharges],
      (err, result) => {
        if (err) {
          console.error("Error registering vendor:", err);
          return response
            .status(500)
            .json({ message: "Internal Server Error" });
        }

        // Success Response
        response.status(201).json({
          message: "Vendor registered successfully",
          vendorId: result.insertId,
        });
      }
    );
  });
});

// api for service_request
app.post("/service-request", (req, res) => {
  console.log("'/service-request' API Called");

  // Extract data from request body
  const {
      userId,
      description,
      street_address,
      city,
      state,
      country,
      pincode
  } = req.body;

  // Validate the incoming data
  if (
      !userId || 
      !description || 
      !street_address || 
      !city || 
      !state || 
      !country || 
      !pincode
  ) {
      return res.status(400).json({ message: "All fields are required" });
  }

  // Insert the data into the `service_request` table
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

//   API for fetching all service requests
app.get("/get-requests", (request, response) => {
    console.log("'/get-requests' API Called");

  const { page = 1, limit = 10 } = request.query; // Default: page 1, limit 10
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
      return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    const totalCount = countResult[0].total;

    db.query(
      dataQuery,
      [parseInt(limit), parseInt(offset)],
      (error, result) => {
        if (error) {
          console.error("Database Error:", error);
          return response
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }

        return response.status(200).json({
          success: true,
          data: result,
          totalCount: totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
        });
      }
    );
  });
});

// API route to update status of request based on confirmation Status=> agree (1) / disagree (0) of user (for mobile app)
app.post("/confirmation-service-status", (req, res) => {
    console.log("'/confirmation-service-status' API Called");

  const { userId, serviceId, confirmationStatus } = req.body;

  // Validate request body
  if (
    userId === undefined ||
    serviceId === undefined ||
    confirmationStatus === undefined
  ) {
    return res
      .status(400)
      .json({
        message: "userId, serviceId, and confirmationStatus are required",
      });
  }

  // Determine the new status based on confirmationStatus
  let newStatus;
  if (confirmationStatus === 0) {
    newStatus = 5; // Uncomplete/Closed by user
  } else if (confirmationStatus === 1) {
    newStatus = 4; // In Progress
  } else {
    return res.status(400).json({ message: "Invalid confirmationStatus" });
  }

  // Update the status in the service_request table
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
      res
        .status(200)
        .json({ message: "Status updated successfully", status: newStatus });
    } else {
      res.status(404).json({ message: "No matching record found" });
    }
  });
});

// API Route to fetch vendors name
app.get("/fetch_vendors_name", (req, res) => {
    console.log("'/fetch_vendors_name' API Called");

  const query = "SELECT name FROM vendors WHERE status = 1";

  db.query(query, (error, result) => {
    if (error) {
      console.error("Database Error:", error); // Log error for debugging
      return res.status(500).json({ message: "Internal server error" }); // Generic error message
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  });
});

// API Route to updated service status
app.post("/service_status_update", (request, response) => {
    console.log("'/service_status_update' API Called");

  const { service_id, status, vendor_name } = request.body; // Extract service_id, status, and vendor_name

  if (!service_id || status === undefined || !vendor_name) {
    return response
      .status(400)
      .json({ message: "Service ID, status, and vendor name are required." });
  }

  const query =
    "UPDATE service_request SET status = ?, vendor_alloted = ? WHERE service_id = ?";

  db.query(query, [status, vendor_name, service_id], (error, result) => {
    if (error) {
      console.error("Database error:", error);
      return response.status(500).json({ message: "Database error", error });
    }

    if (result.affectedRows === 0) {
      return response
        .status(404)
        .json({ message: "Service request not found." });
    }

    response.json({
      message: "Service status and vendor updated successfully.",
    });
  });
});

// API Route for returning the confirm request
app.get("/get-confirm-request", (request, response) => {
    console.log("/get-confirm-request API Called");
  const { page = 1, limit = 10 } = request.query; // Default: page 1, 10 items per page
  const offset = (page - 1) * limit;

  const countQuery =
    "SELECT COUNT(*) AS total FROM service_request WHERE status = 2";
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
      return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    const totalCount = countResult[0].total;

    db.query(
      dataQuery,
      [parseInt(limit), parseInt(offset)],
      (error, result) => {
        if (error) {
          console.error("Database Error:", error);
          return response
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }

        return response.status(200).json({
          success: true,
          data: result,
          totalCount: totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
        });
      }
    );
  });
});

// API Route for returnig the closed request
app.get("/get-closed-request", (request, response) => {
    console.log("/get-closed-request API Called");
  const { page = 1, limit = 10 } = request.query; // Default: page 1, 10 items per page
  const offset = (page - 1) * limit;

  const countQuery =
    "SELECT COUNT(*) AS total FROM service_request WHERE status = 3";
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
      return response
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    const totalCount = countResult[0].total;

    db.query(
      dataQuery,
      [parseInt(limit), parseInt(offset)],
      (error, result) => {
        if (error) {
          console.error("Database Error:", error);
          return response
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }

        return response.status(200).json({
          success: true,
          data: result,
          totalCount: totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
        });
      }
    );
  });
});

// update-complete status
app.post("/update-complete-status", (request, response) => {
    console.log("/update-complete-status API Called");
  const { userId, serviceId, confirmationStatus } = request.body;

  // Validate request body
  if (
    userId === undefined ||
    serviceId === undefined ||
    confirmationStatus === undefined
  ) {
    return response
      .status(400)
      .json({
        message: "userId, serviceId, and confirmationStatus are required",
      });
  }

  // Determine the new status and the corresponding message
  let newStatus;
  let messageOnCompleteStatus;

  if (confirmationStatus === "2") {
    newStatus = 2; // Completed
    messageOnCompleteStatus = 1;
  } else if (confirmationStatus === "3") {
    newStatus = 3; // Uncomplete/Closed
    messageOnCompleteStatus = 2; // show 2 when it is incomplete or closed
  } else {
    return response.status(400).json({ message: "Invalid confirmationStatus" });
  }

  // Update the status and complete_status message in the service_request table
  const query = `
        UPDATE service_request 
        SET status = ?, complete_status = ? 
        WHERE userID = ? AND service_id = ?
    `;

  db.query(
    query,
    [newStatus, messageOnCompleteStatus, userId, serviceId],
    (error, result) => {
      if (error) {
        console.error("Database error:", error);
        return response.status(500).json({ message: "Database error", error });
      }

      if (result.affectedRows > 0) {
        response
          .status(200)
          .json({
            message: "Status updated successfully",
            status: newStatus,
            complete_status: messageOnCompleteStatus,
          });
      } else {
        response.status(404).json({ message: "No matching record found" });
      }
    }
  );
});

// API Route for getting all services based on UserID
app.post("/get-userid-services", (req, res) => {
    console.log("'/get-userid-services' API Called");

  const { user_id } = req.body; // Get user_id from POST request

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = "SELECT * FROM service_request WHERE userID = ?";

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

// API Route for deleting the Vendor from records based on vendor_ID
app.delete("/delete_vendor/:id", (req, res) => {
    console.log("'/delete_vendor/:id' API Called");
  const vendorId = req.params.id;

  // Check if the vendor exists
  db.query("SELECT * FROM vendors WHERE id = ?", [vendorId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching vendor", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Delete vendor
    db.query("DELETE FROM vendors WHERE id = ?", [vendorId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error deleting vendor", error: err });
      }
      return res.status(200).json({ message: "Vendor deleted successfully" });
    });
  });
});

// API Route for updating vendor status
app.post("/update_vendor_status", (req, res) => {
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

// app.get("/pending-services", (req, res) => {
//   console.log("'/pending-services' API Called");
  
//   const query = `
//       SELECT 
//           sr.service_id,
//           sr.service_description,
//           u.username,
//           sr.location,
//           sr.created_at,
//           sr.status
//       FROM service_request sr
//       JOIN users u ON sr.userID = u.userID
//       WHERE sr.status = 0
//       ORDER BY sr.created_at DESC
//       LIMIT 5
//   `;

//   db.query(query, (error, results) => {
//       if (error) {
//           console.error("Database Error:", error);
//           return res.status(500).json({
//               success: false,
//               message: "Internal server error"
//           });
//       }

//       if (results.length === 0) {
//           return res.status(404).json({
//               success: false,
//               message: "No pending service requests found"
//           });
//       }

//       return res.status(200).json({
//           success: true,
//           count: results.length,
//           data: results
//       });
//   });
// });

// pending services including contact number of user
app.get("/pending-services", (req, res) => {
  console.log("'/pending-services' API Called");
  
  const query = `
      SELECT 
          sr.service_id,
          sr.service_description,
          u.username,
          u.contact, -- Added contact field
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

      if (results.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No pending service requests found"
          });
      }

      return res.status(200).json({
          success: true,
          count: results.length,
          data: results
      });
  });
});

// APP LISTENING TO PORT 8081
const PORT = process.env.PORT
console.log("PORT affected :",PORT)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node Server Listening at: http://localhost:${PORT}`);
  // console.log(`Backend running on http://0.0.0.0:${PORT}`); // when using network
  
});
