document.getElementById('characterForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    var formData = new FormData(this);

    // Construct the email body
    var emailBody = "";
    formData.forEach(function(value, key) {
        emailBody += key + ": " + value + "\n";
    });

    // Send the email
    window.location.href = "mailto:robbe.anckaert@gmail.com?subject=Shattered Wiki Addition&body=" + encodeURIComponent(emailBody);
});