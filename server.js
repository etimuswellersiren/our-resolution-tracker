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

// Route to delete a specific resolution by index
app.delete('/api/resolutions/:index', (req, res) => {
    const index = parseInt(req.params.index);
    let history = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
    
    if (index >= 0 && index < history.length) {
        history.splice(index, 1); // Remove the item
        fs.writeFileSync('data.json', JSON.stringify(history, null, 2));
        res.status(200).send('Deleted successfully');
    } else {
        res.status(404).send('Entry not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/api/resolutions/update-all', (req, res) => {
    fs.writeFileSync('data.json', JSON.stringify(req.body, null, 2));
    res.status(200).send('Updated');
});

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // This looks at the "Environment Variables" you set on Render
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// Function to notify the other person
async function sendUpdateEmail(toEmail, subject, text) {
    await transporter.sendMail({
        from: '"Relationship Tracker" <your-app-email@gmail.com>',
        to: toEmail,
        subject: subject,
        text: text
    });
}

// When a new issue is added via the Website or API
app.post('/api/resolutions', async (req, res) => {
    const history = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
    history.push(req.body);
    fs.writeFileSync('data.json', JSON.stringify(history, null, 2));

    // Notify Husband
    await sendUpdateEmail(
        'husband-email@gmail.com', 
        'New Issue Logged', 
        `Your wife just logged an issue: "${req.body.issue}". Visit the app to respond.`
    );

    res.status(201).send('Saved and Email Sent');
});
