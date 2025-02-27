require('dotenv').config();
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors =require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const createUser = require('../backend/router/signup_r');
const resendOTP = require('../backend/router/signup_r');

//middlewares
app.use(cors());
app.use(express.json());




//post method
app.use('/api',createUser);
app.use('/api',resendOTP);


//Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));


app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "signup.html"));
});


// Database connection
const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));


const PORT= process.env.PORT|| 3000;
app.listen(PORT,() =>{
    console.log("Backend server is running n port", PORT);
});

