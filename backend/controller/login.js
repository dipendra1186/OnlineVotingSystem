const User = require('../model/Customer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


// Login customer

const loginCustomer = async (req, res) => {
    try {
        const { voterID, password } = req.body;
        if (!voterID || !password) return res.status(400).json({ message: 'Voter ID and password are required' });

        const user = await User.findOne({ voterID });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = loginCustomer