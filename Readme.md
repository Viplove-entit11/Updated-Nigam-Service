For running this project on Network:
1. In .env (frontend) add this URL VITE_API_URL=http://192.168.2.28:8081/ 
2. In server.js add this   console.log(`Backend running on http://0.0.0.0:${PORT}`);
3. In server.js add this   origin: ['http://192.168.2.28:3000',],

For running this project on Localhost:
1. In .env (frontend) add this URL VITE_API_URL= http://localhost:8081/
2. In server.js add this     console.log(`Node Server Listening at: http://localhost:${PORT}`);
3. In server.js add this   origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],

