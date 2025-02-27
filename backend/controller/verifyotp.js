const User = require('../model/Customer');

const verifyOTP = async (req, res) => {
    try {
        console.log("Received OTP Verification Request:", req.body);

        const { voterID, otp } = req.body;

        if (!voterID || !otp) {
            return res.status(400).json({ message: 'Voter ID and OTP are required' });
        }

        const user = await User.findOne({ voterID });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Voter ID' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        console.log("OTP verified successfully for voterID:", voterID);
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });

    } catch (error) {
        console.error('Error in OTP verification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = verifyOTP;
