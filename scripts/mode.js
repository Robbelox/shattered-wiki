// Function to toggle between dark and light mode
function toggleDarkMode() {
    const themeLink = document.getElementById('theme-link');
    if (themeLink.getAttribute('href') === '/styles/css_dark.css') {
        themeLink.setAttribute('href', '/styles/css_light.css');
        document.querySelector('.mode-toggle').innerHTML = '☀️';
        localStorage.setItem('mode', 'light');
    } else {
        themeLink.setAttribute('href', '/styles/css_dark.css');
        document.querySelector('.mode-toggle').innerHTML = '🌙';
        localStorage.setItem('mode', 'dark');
    }
}

// Apply saved mode from localStorage
function applySavedMode() {
    const savedMode = localStorage.getItem('mode');
    const themeLink = document.getElementById('theme-link');
    if (savedMode === 'dark') {
        themeLink.setAttribute('href', '/styles/css_dark.css');
        document.querySelector('.mode-toggle').innerHTML = '🌙';
    } else {
        themeLink.setAttribute('href', '/styles/css_light.css');
        document.querySelector('.mode-toggle').innerHTML = '☀️';
    }
}

// Check for mode in localStorage on page load
window.addEventListener('DOMContentLoaded', function () {
    applySavedMode();
});

// Listen for changes in mode toggle
document.querySelector('.mode-toggle').addEventListener('click', function() {
    toggleDarkMode();
});