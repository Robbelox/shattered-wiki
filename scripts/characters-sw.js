function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqt2jpKBxKcScnjwpK-rUcL1RpEXRoJ4cOmTOHJjIMlS--I61Aca2H9upkJOIF6r3Q1eZMPcwlSqsv/pub?output=csv';

    fetch(url)
        .then(response => response.text())
        .then(csvText => {
            const data = Papa.parse(csvText, { header: true }).data; // Parse the CSV data using PapaParse

            const container = document.getElementById('selection-container'); // Parent container

            data.forEach(entry => {
                const Name = entry['Name'];
                const Face = convertToDirectLink(entry['Face']);
                const Body = convertToDirectLink(entry['Body']);
                const Skin = convertToDirectLink(entry['Skin']);
                const FullName = entry['Full Name'];
                const BirthYear = entry['Birth Year'];
                const DeathYear = entry['Death Year'];
                const Species = entry['Species'];
                const Gender = entry['Gender'];
                const Occupation = entry['Occupation'];
                const Server = entry['Server'];
                const Nation = entry['Nation'];
                const Player = entry['Played By'];
                const Description = entry['Description'];

                // Create the HTML structure
                const tile = document.createElement('div');
                tile.classList.add('tile', 'small-tile');

                tile.innerHTML = `
                    <div class="large-font tile-text">${Name}</div>
                    <img src="${Face}">
                    <div class="container">
                        <div class="info">
                            <div>
                                <a href="${Skin}">
                                    <img src="${Body}" alt="Character Image">
                                </a>
                            </div>
                            <div class="info-text">
                                <div style="font-size: x-large;"><strong>${FullName}</strong></div>
                                <div style="font-size: small;">${BirthYear} - ${DeathYear}</div>
                                <br>
                                <div><strong>Species:</strong> ${Species}</div>
                                <div><strong>Gender:</strong> ${Gender}</div>
                                <div><strong>Occupation:</strong> ${Occupation}</div>
                                <br>
                                <div><strong>Faction:</strong> ${Nation}</div>
                                <br>
                                <div><strong>Played By:</strong> ${Player}</div>
                            </div>
                        </div>
                        <div class="description">
                            ${Description}
                        </div>
                    </div>
                `;

                container.appendChild(tile);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to convert Google Drive link to direct link
function convertToDirectLink(driveLink) {
    const fileIdMatch = driveLink.match(/id=([^&]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}`;
    }
    return driveLink; // Return the original link if no match is found
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', fetchGoogleSheetData);
