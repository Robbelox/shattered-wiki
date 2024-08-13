function fetchGoogleSheetData() {
    const sheetId = '1cKgbZBKcpeCBMboWuKG5OzuD8sUfbJbdwBRYc6kPUgw'; // Your Google Sheets ID

    Tabletop.init({
        key: sheetId,
        simpleSheet: true,
        callback: function(data) {
            const container = document.getElementById('character-container'); // Parent container

            data.forEach(entry => {
                const Name = entry.name;
                const Face = entry.face;
                const Body = entry.body;
                const Skin = entry.skin;
                const FullName = entry.full_name;
                const BirthYear = entry.birth_year;
                const DeathYear = entry.death_year;
                const Species = entry.species;
                const Gender = entry.gender;
                const Occupation = entry.occupation;
                const Server = entry.server;
                const Nation = entry.nation;
                const Player = entry.played_by;
                const Description = entry.description;

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
                                <div style="font-size: small;">${BirthYear - DeathYear}</div>
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
        }
    });
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', fetchGoogleSheetData);