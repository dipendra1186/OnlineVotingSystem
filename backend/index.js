require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./model/db'); // Import MySQL connection
const createUser = require('./router/signup_r');
const resendOTP = require('./router/signup_r');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

console.log("✅ Database imported successfully!");

// API Routes
app.use('/api', createUser);
app.use('/api', resendOTP);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "signup.html"));
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
});
