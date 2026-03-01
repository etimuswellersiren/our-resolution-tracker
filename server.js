const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.')); // Serves your HTML/CSS files

// Route to get all previous resolutions
app.get('/api/resolutions', (req, res) => {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
    res.json(data);
});

// Route to save a new resolution
app.post('/api/resolutions', (req, res) => {
    const history = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
    history.push(req.body);
    fs.writeFileSync('data.json', JSON.stringify(history, null, 2));
    res.status(201).send('Saved successfully');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
