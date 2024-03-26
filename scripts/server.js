const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit-form', (req, res) => {
    // Parse form data
    const formData = req.body;

    // Format message
    const message = `
        New Character Submission:
        Name: ${formData.name}
        Species: ${formData.species}
        // Add more fields as needed...
    `; // Added a closing backtick for the template literal

    // Send Discord DM
    sendDiscordDM(message);

    res.send('Form submitted successfully!');
});

function sendDiscordDM(message) {
    const webhookURL = 'https://discord.com/api/webhooks/1222271779335176283/51P8Xdvp4Ou5urE-ocVGo2R2MsvG95WBX9_2o5ylveBp5nMbFslSIIV-cJjTczUoqHYx';
    
    axios.post(webhookURL, { content: message })
        .then(response => {
            console.log('Message sent to Discord');
        })
        .catch(error => {
            console.error('Error sending message to Discord:', error);
        });
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
