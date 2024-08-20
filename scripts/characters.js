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

        if (tile) {
            const tileContainer = tile.querySelector('.container');
            tileContainer.classList.toggle('show');
            hideAllContainersExcept(tile);
        } else if (!clickedElement.closest('.container')) {
            // Hide all containers if click is outside of any container
            const tiles = container.querySelectorAll('.tile');
            tiles.forEach(tile => {
                tile.querySelector('.container').classList.remove('show');
            });
        }
    });

    fetchGoogleSheetData();

    function fetchGoogleSheetData() {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqt2jpKBxKcScnjwpK-rUcL1RpEXRoJ4cOmTOHJjIMlS--I61Aca2H9upkJOIF6r3Q1eZMPcwlSqsv/pub?output=csv';

        fetch(url)
            .then(response => response.text())
            .then(csvText => {
                const data = Papa.parse(csvText, { header: true }).data;
                const pathname = window.location.pathname;
                let filteredData = data;

                if (pathname.includes('characters-sw.html')) {
                    filteredData = data.filter(entry => entry['Server'] && entry['Server'].includes('Shattered World 1'));
                }
                
                container.innerHTML = ''; // Clear existing content

                // Function to load characters
                function loadCharacter(entry) {
                    const Name = entry['Name'] || 'Unknown';
                    const Face = convertToDirectLink(entry['Face']);
                    
                    // Create the HTML structure
                    const tile = document.createElement('div');
                    tile.classList.add('tile', 'small-tile');
                    tile.innerHTML = `
                        <div class="large-font tile-text">${Name}</div>
                        <img src="${Face}" alt="${Name}'s Face">
                        <div class="container">
                            <!-- Container content -->
                        </div>
                    `;
                    container.appendChild(tile);
                }

                // Render data (for simplicity, only partial code is shown)
                filteredData.forEach(entry => loadCharacter(entry));
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function convertToDirectLink(driveLink) {
        const fileIdMatch = driveLink.match(/id=([^&]+)/);
        return fileIdMatch ? `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}` : driveLink;
    }
});
