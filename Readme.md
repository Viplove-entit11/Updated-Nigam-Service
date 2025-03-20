For running this project on Network:
1. In .env (frontend) add this URL VITE_API_URL=http://192.168.2.28:8081/ 
2. In server.js add this   console.log(`Backend running on http://0.0.0.0:${PORT}`);
3. In server.js add this   origin: ['http://192.168.2.28:3000',],

For running this project on Localhost:
1. In .env (frontend) add this URL VITE_API_URL= http://localhost:8081/
2. In server.js add this     console.log(`Node Server Listening at: http://localhost:${PORT}`);
3. In server.js add this   origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],

Project Directory Structure:
```bash
.
├── .gitignore
├── Payload_response.txt
├── Readme.md
├── Backend
│   ├── .env
│   ├── check-env.js
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js.old
│   ├── logs
│   └── src
│       ├── server.js
│       ├── config
│       │   └── database.js
│       ├── middleware
│       └── routes
│           ├── admin.routes.js
│           ├── service.routes.js
│           ├── user.routes.js
│           └── vendor.routes.js
│       └── utils
└── Frontend
    ├── .env
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── vite.config.js
    ├── public
    │   └── vite.svg
    └── src
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── assets
        │   └── react.svg
        ├── Components
        │   ├── Admin form
        │   │   ├── AdminForm.css
        │   │   └── AdminForm.jsx
        │   ├── Closed Request
        │   │   ├── ClosedRequest.css
        │   │   └── ClosedRequest.jsx
        │   ├── Confirm Request
        │   │   ├── ConfirmRequest.css
        │   │   └── ConfirmRequest.jsx
        │   ├── Dashboard
        │   │   ├── Dashboard.css
        │   │   └── Dashboard.jsx
        │   ├── Loader
        │   │   ├── Loader.css
        │   │   └── Loader.jsx
        │   ├── Navbar
        │   │   ├── Navbar.css
        │   │   └── Navbar.jsx
        │   ├── ProtectedRoute
        │   │   ├── ProtectedRoute.css
        │   │   └── ProtectedRoute.jsx
        │   ├── Sidebar
        │   │   ├── Sidebar.css
        │   │   └── Sidebar.jsx
        │   ├── Total Request
        │   │   ├── TotalRequest.css
        │   │   └── TotalRequest.jsx
        │   ├── Vendor Data
        │   │   ├── VendorData.css
        │   │   └── VendorData.jsx
        │   └── Vendor Details
        │       ├── VendorDetails.css
        │       └── VendorDetails.jsx
        ├── Context
        │   └── Context.jsx
        └── Pages
            ├── Admin Login
            │   ├── AdminLogin.css
            │   └── AdminLogin.jsx
            ├── Main Page
            │   ├── MainPage.css
            │   └── MainPage.jsx
            └── Payment
                ├── Payment.css
                └── Payment.jsx
```