document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('selection-container'); // The container where tiles are dynamically added

    // Function to hide all containers except the one related to the clicked tile
    function hideAllContainersExcept(clickedTile) {
        const tiles = container.querySelectorAll('.tile');
        tiles.forEach(tile => {
            const tileContainer = tile.querySelector('.container');
            if (tile !== clickedTile) {
                tileContainer.classList.remove('show');
            }
        });
    }

    // Event delegation for click events on tiles and containers
    document.addEventListener('click', function (event) {
        const clickedElement = event.target;
        const tile = clickedElement.closest('.tile');
        const clickedInsideContainer = clickedElement.closest('.container');

        if (tile) {
            const tileContainer = tile.querySelector('.container');
            tileContainer.classList.toggle('show');
            hideAllContainersExcept(tile);
        } else if (!clickedInsideContainer) {
            // Hide all containers if click is outside of any tile or container
            const tiles = container.querySelectorAll('.tile');
            tiles.forEach(tile => {
                tile.querySelector('.container').classList.remove('show');
            });
        }
    });

    // Function to fetch and render the Google Sheet data
    function fetchGoogleSheetData() {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqt2jpKBxKcScnjwpK-rUcL1RpEXRoJ4cOmTOHJjIMlS--I61Aca2H9upkJOIF6r3Q1eZMPcwlSqsv/pub?output=csv';

        fetch(url)
            .then(response => response.text())
            .then(csvText => {
                const data = Papa.parse(csvText, { header: true }).data;
                const pathname = window.location.pathname;
                let filteredData = data;

                // Apply filters based on the HTML file name
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

                // Clear existing content
                container.innerHTML = '';

                // Function to load characters
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
                    // Split the Nation string by comma, process each nation, and add as class
                    const nationClasses = Nation.split(',').map(nation => nation.trim().replace(/\s+/g, '-').toLowerCase());

                    tile.classList.add('tile', 'small-tile', ...nationClasses);

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

                // Sort by Nation first, then by Name
                const sortedData = filteredData.slice().sort((a, b) => {
                    const nationA = (a['Nation'] || '').toLowerCase();
                    const nationB = (b['Nation'] || '').toLowerCase();
                    const nameA = (a['Name'] || '').toLowerCase();
                    const nameB = (b['Name'] || '').toLowerCase();

                    if (nationA < nationB) return -1;
                    if (nationA > nationB) return 1;
                    return nameA.localeCompare(nameB);
                });

                // Render characters in batches for better performance
                let renderIndex = 0;
                const renderBatchSize = 10; // Render in batches
                let lastRenderedNation = ''; // Track the last rendered nation
                let nationDiv; // Container for each nation's characters

                function renderNextBatch() {
                    const batch = sortedData.slice(renderIndex, renderIndex + renderBatchSize);

                    batch.forEach(entry => {
                        const currentNation = entry['Nation'] || 'Unknown';

                        // Check if we are in a new nation group
                        if (currentNation !== lastRenderedNation) {
                            // Close the previous nationDiv if it exists
                            if (nationDiv) {
                                container.appendChild(nationDiv);
                                // Add a <br> between different nation blocks
                                const nationBreak = document.createElement('br');
                                container.appendChild(nationBreak);
                            }

                            // Create a new nation div
                            nationDiv = document.createElement('div');
                            nationDiv.classList.add('nation-group');
                            nationDiv.innerHTML = `<strong>${currentNation}</strong><br>`;

                            // Update the last rendered nation
                            lastRenderedNation = currentNation;
                        }

                        // Append the character tile to the current nation div
                        const characterTile = loadCharacter(entry);
                        nationDiv.appendChild(characterTile);
                    });

                    // Append the last nation block after the loop finishes
                    if (nationDiv) {
                        container.appendChild(nationDiv);
                    }

                    renderIndex += renderBatchSize;

                    // If more characters to render, load the next batch
                    if (renderIndex < sortedData.length) {
                        setTimeout(renderNextBatch, 50); // Small delay between batches
                    }
                }

                // Start rendering immediately after filtering and sorting
                renderNextBatch();
            })
            .catch(error => console.error('Error fetching data:', error));
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
