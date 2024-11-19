document.addEventListener("DOMContentLoaded", function () {
    const screen = document.querySelector('.screen-holder'); // Get the screen div where containers will be added
    const hardcodedNamesElement = document.getElementById('hardcoded-names'); // Get the hardcoded names element
    const hardcodedNames = hardcodedNamesElement 
        ? hardcodedNamesElement.textContent.trim().split(',').map(name => name.trim().toLowerCase())
        : []; // Parse names into an array

    // Function to fetch and render the Google Sheet data
    function fetchGoogleSheetData() {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqt2jpKBxKcScnjwpK-rUcL1RpEXRoJ4cOmTOHJjIMlS--I61Aca2H9upkJOIF6r3Q1eZMPcwlSqsv/pub?output=csv';

        fetch(url)
            .then(response => response.text())
            .then(csvText => {
                const data = Papa.parse(csvText, { header: true }).data;

                let filteredData;
                if (hardcodedNames.length > 0) {
                    // Filter data to include only the hardcoded names
                    filteredData = data.filter(entry => {
                        const characterName = (entry['Name'] || '').trim().toLowerCase();
                        return hardcodedNames.includes(characterName);
                    });
                } else {
                    // No hardcoded names, load all characters
                    filteredData = data;
                }

                // Render characters
                renderCharacters(filteredData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to render characters
    function renderCharacters(data) {
        screen.innerHTML = ''; // Clear existing content
        data.forEach(entry => {
            const characterTile = loadCharacter(entry);
            screen.appendChild(characterTile);
        });
    }

    // Function to load a single character as a tile
    function loadCharacter(entry) {
        const Name = entry['Name'] || 'Unknown';
        const Face = convertToDirectLink(entry['Face']);
        const Body = convertToDirectLink(entry['Body']);
        const Skin = convertToDirectLink(entry['Skin']);
        const FullName = entry['Full Name'] || 'Unknown';
        const BirthYear = entry['Birth Year'] || 'Unknown';
        const DeathYear = entry['Death Year'] || 'Unknown';
        const Species = entry['Species'] || 'Unknown';
        const Pronouns = entry['Pronouns'] || 'Unknown';
        const Occupation = entry['Occupation'] || 'Unknown';
        const Nation = entry['Nation'] || 'Unknown';
        const Player = entry['Played By'] || 'Unknown';
        const Description = convertToParagraphs(entry['Description']);

        // Create the HTML structure for a tile
        const tile = document.createElement('div');
        tile.classList.add('tile', 'small-tile');

        tile.innerHTML = `
            <div class="large-font tile-text">${Name}</div>
            <img src="${Face}" alt="${Name}'s Face">
            <div class="container">
                <div class="info">
                    <div class="fullbody">
                        <a href="${Skin}">
                            <img src="${Body}" alt="Character Image">
                        </a>
                    </div>
                    <div class="info-text">
                        <div style="font-size: x-large;"><strong>${FullName}</strong></div>
                        <div style="font-size: small;">${BirthYear} - ${DeathYear}</div>
                        <br>
                        <div><strong>Pronouns:</strong> ${Pronouns}</div>
                        <div><strong>Species:</strong> ${Species}</div>
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

        return tile; // Return the created tile
    }

    // Helper function to convert Google Drive link to direct link
    function convertToDirectLink(driveLink) {
        const fileIdMatch = driveLink.match(/id=([^&]+)/);
        return fileIdMatch ? `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}` : driveLink;
    }

    // Helper function to convert description text into paragraphs
    function convertToParagraphs(text) {
        if (!text) return '';
        return text
            .trim()
            .split(/\n\s*\n/) // Split by double newlines
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('');
    }

    // Call the function to load data
    fetchGoogleSheetData();
});
