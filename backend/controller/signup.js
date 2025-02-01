const User = require('../model/Customer');
const bcrypt = require('bcrypt');

const createCustomer = async (req, res) => {
    try {
        const { fullName, age, religion, gender, email, password, voterID } = req.body;

        // Validate required fields
        if (!fullName || !age || !religion || !gender || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate age (minimum voting age of 18)
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18) {
            return res.status(400).json({ message: 'Age must be 18 or above' });
        }

        // Validate religion
        const validReligions = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Other'];
        if (!validReligions.includes(religion)) {
            return res.status(400).json({ message: 'Invalid religion selected' });
        }

        // Validate gender
        const validGenders = ['Male', 'Female', 'Other'];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ message: 'Invalid gender selected' });
        }

        // Validate email format
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Validate or generate voterID
        let finalVoterID = voterID;
        if (!voterID) {
            // Generate a 5-digit voter ID
            finalVoterID = Math.floor(10000 + Math.random() * 90000).toString();
        } else {
            // Validate provided voter ID format (5 digits)
            if (!/^\d{5}$/.test(voterID)) {
                return res.status(400).json({ message: 'Voter ID must be 5 digits' });
            }
        }

        // Check if voter ID already exists
        const existingVoterID = await User.findOne({ voterID: finalVoterID });
        if (existingVoterID) {
            return res.status(400).json({ message: 'Voter ID already exists' });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            fullName,
            age: ageNum,
            religion,
            gender,
            email,
            password: hashedPassword,
            voterID: finalVoterID,
            role: 'Voter' // Default role for all registrations
        });

        // Save to database
        await newUser.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                fullName: newUser.fullName,
                email: newUser.email,
                voterID: newUser.voterID,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Error in createCustomer:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false,
                message: `${field} already exists` 
            });
        }

        // Handle other errors
        res.status(500).json({ 
            success: false,
            message: 'Registration failed. Please try again.' 
        });
    }
};

module.exports = createCustomer;