require("events").EventEmitter.defaultMaxListeners = 20;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const fs = require("fs");
const db = require("./model/db"); // MySQL connection
const candidateRoutes = require("./routes/candidate");

const app = express();

// ✅ Middleware Setup
app.use(cors());
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ✅ MySQL Connection Check
db.query("SELECT 1")
    .then(() => console.log("✅ MySQL Connected Successfully"))
    .catch(err => console.error("❌ MySQL Connection Failed:", err));

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Cloudinary Connection Check
cloudinary.api.ping()
    .then(() => console.log("✅ Cloudinary Connected Successfully!"))
    .catch(err => console.error("❌ Cloudinary Connection Failed:", err.message));

// ✅ Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
        allowed_formats: ["jpg", "png", "jpeg"],
        public_id: (req, file) => `image_${Date.now()}`,
    },
});

const upload = multer({ storage });

// ✅ Create uploads directory if not exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ API Routes
app.use("/api", candidateRoutes);

// ✅ Image Upload Route
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded!" });
    }
    res.status(200).json({
        message: "Image uploaded successfully!",
        imageUrl: req.file.path,
    });
});

// ✅ Serve Static Frontend Files
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Signup Page
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "signup.html"));
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Global Error:", err.message);
    res.status(500).json({ error: "Something went wrong!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
});
