const db = require('../model/db'); // Import the database connection

const verifyOTP = async (req, res) => {
    try {
        console.log("Received OTP Verification Request:", req.body);

        const { voterID, otp } = req.body;

        if (!voterID || !otp) {
            return res.status(400).json({ message: 'Voter ID and OTP are required' });
        }

        // Fetch OTP from database
        const [rows] = await db.query("SELECT otp FROM users WHERE voterID = ?", [voterID]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Voter ID' });
        }

        const user = rows[0];

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark as verified
        await db.query("UPDATE users SET isVerified = 1 WHERE voterID = ?", [voterID]);

        console.log("✅ OTP verified successfully for voterID:", voterID);
        res.status(200).json({ success: true, message: 'OTP verified successfully.', voterID });

    } catch (error) {
        console.error('❌ Error in OTP verification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = verifyOTP;
