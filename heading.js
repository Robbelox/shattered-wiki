const mq = window.matchMedia("(max-width: 768px)");
let showcaseContent = "";

function renderHeader(e) {
    const existingShowcase = document.getElementById("showcase");
    if (existingShowcase) {
        showcaseContent = existingShowcase.innerHTML;
    }

    if (e.matches) {
        // MOBILE HEADER
        header.innerHTML = `
            <div id="header-top" class="center">
                <a id="header-logo" href="index.html">
                    <img src="images/header-logo.webp" alt="Home Button">
                </a>
                <div id="header-text">Shattered Wiki</div>
            <div id="showcase">${showcaseContent}</div>
            </div>

            <div id="header-navigation">
                <a class="navigation-option center" href="pages/meta/realms/realms.html">Realms</a>
                <a class="navigation-option center" href="pages/meta/seasons/seasons.html">Seasons</a>
                <a class="navigation-option center" href="pages/meta/nations/nations.html">Nations</a>
                <a class="navigation-option center" href="pages/meta/characters/characters.html">Characters</a>
                <a class="navigation-option center" href="pages/meta/mechanics/mechanics.html">Mechanics</a>
            </div>
        `;
    } else {
        // DESKTOP HEADER (unchanged structure)
        header.innerHTML = `
            <div id="header-text" class="center">Shattered Wiki</div>
            <a id="header-logo" class="center" href="index.html">
                <img src="images/header-logo.webp" alt="Home Button">
            </a>
            <div class="center" id="header-navigation">
                <a class="navigation-option center" href="pages/meta/realms/realms.html">Realms</a>
                <a class="navigation-option center" href="pages/meta/seasons/seasons.html">Seasons</a>
                <a class="navigation-option center" href="pages/meta/nations/nations.html">Nations</a>
                <a class="navigation-option center" href="pages/meta/characters/characters.html">Characters</a>
                <a class="navigation-option center" href="pages/meta/players/players.html">Players</a>
                <a class="navigation-option center" href="pages/meta/mechanics/mechanics.html">Mechanics</a>
            </div>
            <div id="showcase">${showcaseContent}</div>
        `;
    }
}

renderHeader(mq);
mq.addEventListener("change", renderHeader);