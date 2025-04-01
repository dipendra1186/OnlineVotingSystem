const express = require("express");
const router = express.Router();

// Import controllers
const signupController = require("./controller/signup");
const loginController = require("./controller/login");
const otpController = require("./controller/verifyotp");
const resendOtpController = require("./controller/resendotp");
const dashboardController = require("./controller/Dash");
const candidateController = require("../backend/controller/Candidate");

// ✅ Authentication Routes
router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/verify-otp", otpController);
router.post("/resend-otp", resendOtpController);

// ✅ Dashboard & Candidate Routes
router.use("/dashboard", dashboardController);
router.use("/api", candidateController);

// ✅ API Health Check
router.get("/test", (req, res) => {
    res.json({ message: "API is working fine!" });
});

module.exports = router;
