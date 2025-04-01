const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = require('../model/db');

// Fetch total voters from users table
app.get('/api/totalVoters', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT COUNT(*) AS totalVoters FROM users WHERE LOWER(role) = "voter"');
        console.log('Total Voters Query Result:', rows);
        res.json(rows[0] || { totalVoters: 0 }); // Ensure response is always an object
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ error: err.message });
    }
});




// Fetch all candidates from the candidates table with additional details
app.get('/api/candidates', async (req, res) => {
    try {
        // Fetch candidates from the database
        const [rows] = await db.execute(`
            SELECT 
                id, 
                name, 
                party, 
                age, 
                qualification, 
                promises, 
                photo, 
                created_at
            FROM candidates
        `);
        console.log('Candidates Query Result:', rows);

        // Ensure response is always an array (if no candidates, return an empty array)
        res.json(rows || []);
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Fetch total votes per candidate
app.get('/api/votes', (req, res) => {
    db.query('SELECT candidate_id, COUNT(*) AS votes FROM votes GROUP BY candidate_id', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Fetch election end time
app.get('/api/electionEndTime', (req, res) => {
    db.query('SELECT end_time FROM election_settings LIMIT 1', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0]);
    });
});

// Fetch voter details
app.get('/api/voter/:voterID', (req, res) => {
    const { voterID } = req.params;
    db.query('SELECT fullName, age, gender, email, voterID FROM users WHERE voterID = ?', [voterID], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || {});
    });
});

// Cast a vote
app.post('/api/vote', (req, res) => {
    const { voterID, candidate_id } = req.body;
    
    // Check if voter has already voted
    db.query('SELECT * FROM votes WHERE voter_id = ?', [voterID], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            return res.status(400).json({ error: 'You have already voted!' });
        }

        // Insert vote
        db.query('INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)', [voterID, candidate_id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Vote cast successfully' });
        });
    });
});

module.exports = app;
