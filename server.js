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
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for Port 587
  requireTLS: true, // Forces Nodemailer to use STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Increase timeouts to account for cold starts on Render
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 15000,
  socketTimeout: 15000,
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

app.get('/test-email', async (req, res) => {
  console.log("--- Starting Email Test ---");
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER, // Send it to yourself for the test
    subject: "Render Server Test ✅",
    text: `Test successful! Sent at: ${new Date().toISOString()}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    res.status(200).send(`<h1>Success!</h1><p>Email sent: ${info.response}</p>`);
  } catch (error) {
    console.error("❌ Test Route Failed:", error);
    res.status(500).send(`<h1>Failed</h1><pre>${error.message}</pre>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
