document.addEventListener("DOMContentLoaded", function () {
    const characterTiles = document.querySelectorAll('.character-selection-tile');

    characterTiles.forEach(tile => {
        tile.addEventListener('click', function () {
            const container = this.querySelector('.container');
            container.classList.toggle('show');
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const smallTiles = document.querySelectorAll('.small-selection-tile');

    smallTiles.forEach(tile => {
        tile.addEventListener('click', function () {
            const container = this.querySelector('.container');
            container.classList.toggle('show');
        });
    });
});