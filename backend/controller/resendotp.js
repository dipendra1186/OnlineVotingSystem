const User = require('../model/Customer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');



// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { voterID } = req.body;
        if (!voterID) return res.status(400).json({ message: 'Voter ID is required' });

        const user = await User.findOne({ voterID });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Generate new OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOTP;
        user.otpExpiry = new Date();
        user.otpExpiry.setMinutes(user.otpExpiry.getMinutes() + 10);
        await user.save();

        // Send OTP email
        await sendOTP(user.email, newOTP);
        res.status(200).json({ message: 'New OTP sent successfully. Please check your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

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

module.exports = resendOTP;