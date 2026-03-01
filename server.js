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

// 1. Create the transporter logic
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 537,
  secure: false, // Use SSL for port 465
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: true, // Show debug output in logs
  logger: true  // Log the SMTP traffic
});

// Test the connection immediately on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Connection Error Detail:", error);
  } else {
    console.log("✅ Server is ready to send messages!");
  }
});

// 2. Verification function to debug Render logs
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
  } catch (error) {
    console.error("Nodemailer verification failed:", error);
  }
};

verifyConnection();

// 3. Example Send Function
const sendNotification = async (subject, text) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

// Function to notify the other person
async function sendUpdateEmail(toEmail, subject, text) {
    await transporter.sendMail({
        from: '"Relationship Tracker" <sirenresolutions@gmail.com>',
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
        'etimusweller@gmail.com', 
        'New Issue Logged', 
        `Your wife just logged an issue: "${req.body.issue}". Visit the app to respond.`
    );

    res.status(201).send('Saved and Email Sent');
});
