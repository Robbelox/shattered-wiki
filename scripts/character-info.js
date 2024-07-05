document.addEventListener("DOMContentLoaded", function () {
    const tiles = document.querySelectorAll('.tile');

    // Function to hide all containers except the one related to the clicked tile
    function hideAllContainersExcept(clickedTile) {
        tiles.forEach(tile => {
            if (tile !== clickedTile) {
                tile.querySelector('.container').classList.remove('show');
            }
        });
    }

    document.addEventListener('click', function (event) {
        const clickedElement = event.target;

        // If clicked element is a tile or its image
        if (clickedElement.classList.contains('tile') || clickedElement.classList.contains('tile') || clickedElement.tagName === 'IMG') {
            const container = clickedElement.closest('.tile').querySelector('.container');
            container.classList.toggle('show');
            // Hide all other containers
            hideAllContainersExcept(clickedElement.closest('.tile'));
        } 
        // If clicked element is not a container or its parent
        else if (!clickedElement.closest('.container')) {
            // Hide all containers
            tiles.forEach(tile => {
                tile.querySelector('.container').classList.remove('show');
            });
        }
    });

    // Prevent hiding container when clicking on image inside the container
    tiles.forEach(tile => {
        const container = tile.querySelector('.container');
        const containerImage = container.querySelector('img');
        containerImage.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click event from bubbling up to parent elements
        });
    });
});