const axios = require('axios');

// Handle form submission
app.post('https://formspree.io/f/mqkrypqd', (req, res) => {
    // Parse form data
    const formData = req.body;

    // Format message
    const message = `
        New Message Submission:
        Message: ${formData.message}
    `;

    // Send the message to Formspree
    axios.post('https://formspree.io/f/mqkrypqd', formData)
        .then(response => {
            console.log('Form submitted successfully!');
            res.send('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            res.status(500).send('Error submitting form. Please try again later.');
        });
});
