require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

// Database connection function
async function connectDB() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
}

// Function to generate unique ID
async function generateUniqueID(role, fullName, connection) {
    let prefix = role === "Admin" ? "A" : "V"; // Prefix for Admin (A) or Voter (V)
    
    // Extract first letters from full name
    const nameParts = fullName.split(' ');
    const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    const uniqueID = `${firstNameInitial}${lastNameInitial}${Math.floor(10000 + Math.random() * 90000)}`; // Example: DT47856
    
    let existingID;
    do {
        // Check if ID exists in the database
        const [rows] = await connection.execute(
            `SELECT * FROM ${role === "Admin" ? "admins" : "voters"} WHERE ${role === "Admin" ? "adminID" : "voterID"} = ?`, 
            [uniqueID]
        );
        existingID = rows.length > 0; // If ID exists, loop again
    } while (existingID);

    return uniqueID;
}

// Updated createCustomer function
const createCustomer = async (req, res) => {
    try {
        const { fullName, age, religion, gender, email, password, role } = req.body;

        // Check if all fields are provided
        if (!fullName || !age || !religion || !gender || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate age
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18) {
            return res.status(400).json({ message: 'Age must be 18 or above' });
        }

        const connection = await connectDB();

        // Check if email already exists in the database
        const [existingUser] = await connection.execute(
            `SELECT * FROM ${role === "Admin" ? "admins" : "voters"} WHERE email = ?`, 
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate a unique voterID or adminID
        const userID = await generateUniqueID(role, fullName, connection);
        console.log(`Generated User ID: ${userID}`); // Debug log to see the generated ID

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP and set expiry
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Insert user data into the respective table
        const insertQuery = role === "Admin" 
            ? `INSERT INTO admins (fullName, age, religion, gender, email, password, adminID, otp, otpExpiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            : `INSERT INTO voters (fullName, age, religion, gender, email, password, voterID, otp, otpExpiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Insert data if everything is valid
        const [result] = await connection.execute(insertQuery, [
            fullName, ageNum, religion, gender, email, hashedPassword, userID, otp, otpExpiry
        ]);
        console.log(`Inserted user with ID: ${userID}`); // Debug log to verify insertion

        // Send OTP and generated ID via email
        await sendOTP(email, otp, userID, role);

        // Send success response
        res.status(200).json({ success: true, message: `User registered successfully as ${role}. Check your email for your ${role === "Admin" ? "Admin ID" : "Voter ID"}.` });

    } catch (error) {
        console.error("Error in createCustomer:", error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.', error: error.message });
    }
};

// Updated sendOTP function to include the ID in email
const sendOTP = async (email, otp, userID, role) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'timalsinadipendra125@gmail.com',  // Replace with your email
                pass: 'gtfc mlza rgzr vlwx',            // Replace with your app password
            },
        });

        const mailOptions = {
            from: `"Election Commission" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Registration Details',
            text: `Welcome to the Online Voting System!\n\nYour OTP: ${otp}\nYour ${role === "Admin" ? "Admin ID" : "Voter ID"}: ${userID}\n\nPlease use this ID for login and verification.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email} with OTP and ID.`);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw new Error("Failed to send OTP. Please try again later.");
    }
};

module.exports = createCustomer;
