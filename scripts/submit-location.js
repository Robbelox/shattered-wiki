const axios = require('axios');

// Handle form submission
app.post('https://formspree.io/f/xrgnypqb', (req, res) => {
    // Parse form data
    const formData = req.body;

    // Format message
    const message = `
        New Location Submission:
        World: ${formData.world}
        Name: ${formData.name}
        X-Coordinate: ${formData.x}
        Y-Coordinate: ${formData.y}
    `;

    // Send the message to Formspree
    axios.post('https://formspree.io/f/xrgnypqb', formData)
        .then(response => {
            console.log('Form submitted successfully!');
            res.send('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            res.status(500).send('Error submitting form. Please try again later.');
        });
});
