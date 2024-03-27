const axios = require('axios');

// Handle form submission
app.post('https://formspree.io/f/xleqpjdp', (req, res) => {
    // Parse form data
    const formData = req.body;

    // Format message
    const message = `
        New Character Submission:
        Name: ${formData.name}
        Full Name: ${formData.full_name}
        Birth Year: ${formData.birth_year}
        Death Year: ${formData.death_year}
        Species: ${formData.species}
        Gender: ${formData.gender}
        Occupation: ${formData.occupation}
        Skin: ${formData.skin}
        Nation: ${formData.nation}
        Played By: ${formData.played_by}
        Description: ${formData.description}
        Extras: ${formData.extras}
    `;

    // Send the message to Formspree
    axios.post('https://formspree.io/f/xleqpjdp', formData)
        .then(response => {
            console.log('Form submitted successfully!');
            res.send('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            res.status(500).send('Error submitting form. Please try again later.');
        });
});
