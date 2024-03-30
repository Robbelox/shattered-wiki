const axios = require('axios');

// Handle form submission
app.post('https://formspree.io/f/xrgnypqb', (req, res) => {
    // Parse form data
    const formData = req.body;

    // Format message
    const message = `
        New Location Submission:
        Server: ${formData.server}
        Image: ${formData.image}
        Name: ${formData.name}
        X-Coordinate: ${formData.x}
        Z-Coordinate: ${formData.z}
        Description: ${formData.description}
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
