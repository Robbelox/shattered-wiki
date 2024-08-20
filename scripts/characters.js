function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqt2jpKBxKcScnjwpK-rUcL1RpEXRoJ4cOmTOHJjIMlS--I61Aca2H9upkJOIF6r3Q1eZMPcwlSqsv/pub?output=csv';

    fetch(url)
        .then(response => response.text())
        .then(csvText => {
            const data = Papa.parse(csvText, { header: true }).data; // Parse the CSV data using PapaParse

            const container = document.getElementById('selection-container'); // Parent container

            // Get current page's pathname
            const pathname = window.location.pathname;

            let filteredData = data;

            // Apply filters based on the HTML file
            if (pathname.includes('characters-sw.html')) {
                filteredData = data.filter(entry => entry['Server'] && entry['Server'].includes('Shattered World 1'));
            } else if (pathname.includes('characters-sw2.html')) {
                filteredData = data.filter(entry => entry['Server'] && entry['Server'].includes('Shattered World 2'));
            } else if (pathname.includes('characters-sr.html')) {
                filteredData = data.filter(entry => entry['Server'] && entry['Server'].includes('Shattered Realms'));
            } else if (pathname.includes('characters-sc.html')) {
                filteredData = data.filter(entry => entry['Server'] && entry['Server'].includes('Shattered Crown'));
            } else if (pathname.includes('characters-iteria.html')) {
                filteredData = data.filter(entry => entry['Server'] && entry['Server'].includes('Tales of Iteria'));
            }

            // Sort the filtered data alphabetically by 'Name'
            filteredData.sort((a, b) => (a['Name'] || '').localeCompare(b['Name'] || ''));

            // Clear existing content
            container.innerHTML = '';

            // Function to load characters one by one with a delay
            function loadCharacter(index) {
                if (index >= filteredData.length) return; // Stop if we've loaded all characters

                const entry = filteredData[index];
                const Name = entry['Name'] || 'Unknown';
                const Face = convertToDirectLink(entry['Face']);
                const Body = convertToDirectLink(entry['Body']);
                const Skin = convertToDirectLink(entry['Skin']);
                const FullName = entry['Full Name'] || 'Unknown';
                const BirthYear = entry['Birth Year'] || 'Unknown';
                const DeathYear = entry['Death Year'] || 'Unknown';
                const Species = entry['Species'] || 'Unknown';
                const Gender = entry['Gender'] || 'Unknown';
                const Occupation = entry['Occupation'] || 'Unknown';
                const Server = entry['Server'] || 'Unknown';
                const Nation = entry['Nation'] || 'Unknown';
                const Player = entry['Played By'] || 'Unknown';
                const Description = convertToParagraphs(entry['Description']);

                // Create the HTML structure
                const tile = document.createElement('div');
                tile.classList.add('tile', 'small-tile');

                tile.innerHTML = `
                    <div class="large-font tile-text">${Name}</div>
                    <img src="${Face}" alt="${Name}'s Face">
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

                // Load the next character after a delay
                setTimeout(() => loadCharacter(index + 1), 100); // 300ms delay between each character
            }

            // Start loading characters one by one
            loadCharacter(0);
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

// Function to convert description text into paragraphs
function convertToParagraphs(text) {
    if (!text) return '';
    return text
        .trim() // Remove leading and trailing whitespace
        .split(/\n\s*\n/) // Split text by double newlines, assuming each newline represents a new paragraph
        .map(paragraph => `<p>${paragraph.trim()}</p>`) // Wrap each trimmed paragraph in <p> tags
        .join(''); // Join paragraphs without additional spaces
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', fetchGoogleSheetData);
