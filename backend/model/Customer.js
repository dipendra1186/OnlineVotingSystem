const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['admin', 'voter'], 
        required: true,
        lowercase: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'], 
        required: true,
        lowercase: true
    },
    voterID: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'Age must be at least 18']
    },
    religion: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters']
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);