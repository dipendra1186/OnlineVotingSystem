const express = require('express');
const router = express.Router();
const createCustomer = require('../controller/signup'); // Adjust the path if necessary
const login = require('../controller/login'); // Adjust the path if necessary
const verifyOTP = require('../controller/verifyotp')
const resendOTP = require('../controller/resendotp')

// Define the POST routes properly with handler functions
router.post('/signup', createCustomer);  // This should be a function, not an object
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

module.exports = router;