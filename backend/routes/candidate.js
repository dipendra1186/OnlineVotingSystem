const express = require("express");
const multer = require("multer");
const path = require("path");
const candidateController = require("../controller/Candidate");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
    }
});
const upload = multer({ storage: storage }); // Create multer upload instance

// Routes for handling candidate operations
router.post("/candidates", upload.single("photo"), candidateController.createCandidate);
router.get("/candidates", candidateController.getCandidates);
router.get("/candidates/:id", candidateController.getCandidateById);
router.put("/candidates/:id", candidateController.updateCandidate);
router.delete("/candidates/:id", candidateController.deleteCandidate);

module.exports = router;
