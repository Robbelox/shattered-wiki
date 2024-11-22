function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqt2jpKBxKcScnjwpK-rUcL1RpEXRoJ4cOmTOHJjIMlS--I61Aca2H9upkJOIF6r3Q1eZMPcwlSqsv/pub?output=csv';

    fetch(url)
        .then(response => response.text())
        .then(csvText => {
            const data = Papa.parse(csvText, { header: true }).data;

            // Define filters
            const filters = {
                Name: typeof window.selectedCharacterNames !== 'undefined' ? window.selectedCharacterNames : null,
                Nation: typeof window.selectedNation !== 'undefined' ? window.selectedNation : null,
                Species: typeof window.selectedSpecies !== 'undefined' ? window.selectedSpecies : null,
                'Played By': typeof window.selectedPlayedBy !== 'undefined' ? window.selectedPlayedBy : null,
                Pronouns: typeof window.selectedPronouns !== 'undefined' ? window.selectedPronouns : null,
                Server: typeof window.selectedServers !== 'undefined' ? window.selectedServers : null,
            };

            // Filter data based on the defined filters
            let filteredData = data.filter(entry => {
                return Object.keys(filters).every(key => {
                    if (!filters[key]) return true; // Skip filter if not defined
                    const value = entry[key];
                    return value && filters[key].some(filterValue => value.includes(filterValue));
                });
            });

            // If no filters apply, show all characters
            if (Object.values(filters).every(filter => !filter)) {
                filteredData = data; // Show everything
            }

            screen.innerHTML = ''; // Clear the screen div

            // Function to create a character tile
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
                return tile;
            }

            // Determine sorting and grouping logic
            let sortingKey = 'Nation'; // Default sorting is by Nation
            if (filters.Species) sortingKey = 'Species';
            else if (filters.Name) sortingKey = 'Name';

            // Sort data based on the selected key
            const sortedData = filteredData.slice().sort((a, b) => {
                const keyA = (a[sortingKey] || '').toLowerCase();
                const keyB = (b[sortingKey] || '').toLowerCase();
                return keyA.localeCompare(keyB);
            });

            let renderIndex = 0;
            const renderBatchSize = 10;
            let lastRenderedGroup = '';
            let container;

            function renderNextBatch() {
                const batch = sortedData.slice(renderIndex, renderIndex + renderBatchSize);

                batch.forEach(entry => {
                    const currentGroup = entry[sortingKey]?.split(',')[0]?.trim() || 'Unknown';

                    if (currentGroup !== lastRenderedGroup) {
                        if (container) {
                            screen.appendChild(container);
                        }

                        const groupTitle = document.createElement('h1');
                        groupTitle.style.textAlign = 'center';
                        groupTitle.textContent = currentGroup;
                        screen.appendChild(groupTitle);

                        container = document.createElement('div');
                        container.classList.add('selection-container', 'holder');
                        container.setAttribute('id', `selection-container-${currentGroup.replace(/\s+/g, '-').toLowerCase()}`);
                        lastRenderedGroup = currentGroup;
                    }

                    const characterTile = loadCharacter(entry);
                    container.appendChild(characterTile);
                });

                if (container) {
                    screen.appendChild(container);
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
