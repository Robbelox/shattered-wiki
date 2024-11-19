document.addEventListener("DOMContentLoaded", function () {
    const screen = document.querySelector('.screen-holder'); // Get the screen div where containers will be added

    // Function to hide all containers except the one related to the clicked tile
    function hideAllContainersExcept(clickedTile) {
        const tiles = document.querySelectorAll('.tile');
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
            const tiles = document.querySelectorAll('.tile');
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

                let filteredData = data;

                // Check if specific names are defined in the current HTML file
                if (typeof selectedCharacterNames !== 'undefined') {
                    filteredData = data.filter(entry =>
                        selectedCharacterNames.includes(entry['Name'])
                    );
                } else {
                    // Apply filters based on the HTML file name
                    const pathname = window.location.pathname;
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
                }

                screen.innerHTML = ''; // Clear the screen div

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
                    const primaryNation = Nation.split(',')[0].trim();
                    const nationClass = primaryNation.replace(/\s+/g, '-').toLowerCase();
                    tile.classList.add('tile', 'small-tile', nationClass);

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

                // Sort by Nation first, then by Name
                const sortedData = filteredData.slice().sort((a, b) => {
                    const nameA = (a['Name'] || '').toLowerCase();
                    const nameB = (b['Name'] || '').toLowerCase();
                
                    if (selectedCharacterNames.length > 0) {
                        // Sort alphabetically by name if specific characters are defined
                        return nameA.localeCompare(nameB);
                    }
                
                    // Default sorting by nation and then name
                    const nationsA = (a['Nation'] || '').toLowerCase().split(',').map(nation => nation.trim());
                    const nationsB = (b['Nation'] || '').toLowerCase().split(',').map(nation => nation.trim());
                    const firstNationComparison = nationsA[0].localeCompare(nationsB[0]);
                    if (firstNationComparison !== 0) return firstNationComparison;
                
                    const allNationsA = nationsA.join(',').toLowerCase();
                    const allNationsB = nationsB.join(',').toLowerCase();
                    const nationsComparison = allNationsA.localeCompare(allNationsB);
                    if (nationsComparison !== 0) return nationsComparison;
                
                    return nameA.localeCompare(nameB);
                });              

                // Render characters in batches
                let renderIndex = 0;
                const renderBatchSize = 10;
                let lastRenderedNation = '';
                let nationContainer;

                function renderNextBatch() {
                    const batch = sortedData.slice(renderIndex, renderIndex + renderBatchSize);

                    batch.forEach(entry => {
                        const currentNation = entry['Nation'].split(',')[0].trim() || 'Unknown';
                        if (currentNation !== lastRenderedNation) {
                            if (nationContainer) {
                                screen.appendChild(nationContainer);
                            }

                            const nationBreak = document.createElement('br');
                            if (selectedCharacterNames.length === 0) {
                                const nationTitle = document.createElement('h1');
                                nationTitle.style.textAlign = 'center';
                                nationTitle.textContent = currentNation;
                                screen.appendChild(nationTitle);
                            }
                            

                            nationContainer = document.createElement('div');
                            nationContainer.classList.add('selection-container', 'holder');
                            nationContainer.setAttribute('id', `selection-container-${currentNation.replace(/\s+/g, '-').toLowerCase()}`);

                            lastRenderedNation = currentNation;
                        }

                        const characterTile = loadCharacter(entry);
                        nationContainer.appendChild(characterTile);
                    });

                    if (nationContainer) {
                        screen.appendChild(nationContainer);
                    }

                    renderIndex += renderBatchSize;

                    if (renderIndex < sortedData.length) {
                        setTimeout(renderNextBatch, 50);
                    }
                }

                renderNextBatch();
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function convertToDirectLink(driveLink) {
        const fileIdMatch = driveLink.match(/id=([^&]+)/);
        return fileIdMatch ? `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}` : driveLink;
    }

    function convertToParagraphs(text) {
        if (!text) return '';
        return text
            .trim()
            .split(/\n\s*\n/)
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('');
    }

    fetchGoogleSheetData();
});
