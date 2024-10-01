const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tuition_db',
});

// Endpoint to submit marks
app.post('/api/marks', (req, res) => {
    const { student_name, english, math, hindi, science, social_science } = req.body;

    // Log to ensure the data is received correctly
    console.log('Received data:', req.body);

    db.query(
        'INSERT INTO marks (student_name, english, math, hindi, science, social_science) VALUES (?, ?, ?, ?, ?, ?)',
        [student_name, english, math, hindi, science, social_science],
        (err) => {
            if (err) {
                console.error(err); // Log the error for debugging
                return res.status(500).send(err);
            }
            res.status(200).send('Marks submitted successfully');
        }
    );
});

// Endpoint to get all marks
app.get('/api/marks', (req, res) => {
    db.query('SELECT * FROM marks', (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
