require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const signupController = require("../controller/signup");
const loginController = require("../controller/login");
const otpController = require("../controller/verifyotp");
const resendOtpController = require("../controller/resendotp");

const app = express();

// Middlewares
app.use(bodyParser.json());


// API Routes
app.use("/api/signup", signupController);
app.use("/api/login", loginController);
app.use("/api/verify-otp", otpController);
app.use("/api/resend-otp", resendOtpController);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use(cors());
