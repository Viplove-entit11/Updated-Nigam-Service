const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Create Express app
const app = express();

// ✅ Security middleware (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
        frameSrc: ["'none'"], // ✅ Clickjacking protection
        upgradeInsecureRequests: [], // ✅ Force HTTPS
      },
    },
    frameguard: { action: "deny" }, // ✅ Block iframe embedding
    xssFilter: true, // ✅ XSS protection
    noSniff: true, // ✅ Prevent MIME type sniffing
  })
);

// ✅ HSTS (Strict Transport Security) - 1 year
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=2000000000; includeSubDomains; preload"
    );
  }
  next();
});

// ✅ Rate limiting to prevent DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
});
app.use(limiter);

// ✅ Compression middleware to reduce payload size
app.use(compression());

// ✅ CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3000",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ✅ Request parsing middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Secure Cookies Example
app.use((req, res, next) => {
  res.cookie("token", "sample_value", {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === "production", // Use HTTPS only in production
    sameSite: "Strict", // CSRF protection
  });
  next();
});

// ✅ Routes with API prefix


// ✅ Support for old routes (for backward compatibility)
app.use("/", require("./routes/admin.routes"));
app.use("/", require("./routes/vendor.routes"));
app.use("/", require("./routes/service.routes"));
app.use("/", require("./routes/user.routes"));

// ✅ Default route
app.get("/", (req, res) => {
  console.log("'/' API Called");
  res.json({ message: "Welcome to Nigam Service API" });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ✅ Handle unhandled routes
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
