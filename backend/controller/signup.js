const User = require('../model/Customer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cors = require('cors');
const express = require('express');
const app = express();


// Create a new customer
const createCustomer = async (req, res) => {
    try {
        const { fullName, age, religion, gender, email, password, voterID, role } = req.body;

        // Validate required fields
        if (!fullName || !age || !religion || !gender || !email || !password || !voterID || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate age (minimum 18)
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18) {
            return res.status(400).json({ message: 'Age must be 18 or above' });
        }

        // Validate religion & gender
        const validReligions = ["hindu", "muslim", "christian", "buddhist", "other"];
        if (!validReligions.includes(religion.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid religion' });
        }

        const validGenders = ["male", "female", "other"];
        if (!validGenders.includes(gender.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid gender' });
        }

        // Validate email
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check for existing email & voterID
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        if (await User.findOne({ voterID })) return res.status(400).json({ message: 'Voter ID already exists' });

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash password & generate OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Create new user
        const newUser = new User({
            fullName,
            age: ageNum,
            religion,
            gender,
            email,
            password: hashedPassword,
            voterID,
            role: role || 'Voter',
            otp,
            otpExpiry,
        });
        await newUser.save();

        // Send OTP email
        await sendOTP(email, otp);

        res.status(200).json({ success: true, message: "User registered successfully" });

    } catch (error) {
    console.error("Error in createCustomer:", error); // Log the error
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.', error: error.message });
}};


// Helper function to send OTP email
const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'timalsinadipendra125@gmail.com',
            pass: 'gtfc mlza rgzr vlwx',
        },
    });
    const mailOptions = {
        from: 'timalsinadipendra125@gmail.com',
        to: email,
        subject: 'OTP for Your Registration',
        text: `Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
};


module.exports = createCustomer;
// ✅ Enable CORS before defining routes
app.use(cors());
app.use(express.json());