// Function to toggle between dark and light mode
function toggleDarkMode() {
    const themeLink = document.getElementById('theme-link');
    if (themeLink.getAttribute('href') === '../css_dark.css') {
        themeLink.setAttribute('href', '../css_light.css');
        document.querySelector('.mode-toggle').innerHTML = '☀️';
        localStorage.setItem('mode', '../css_light');
    } else {
        themeLink.setAttribute('href', '../css_dark.css');
        document.querySelector('.mode-toggle').innerHTML = '🌙';
        localStorage.setItem('mode', '../css_dark');
    }
}

// Apply saved mode from localStorage
function applySavedMode() {
    const savedMode = localStorage.getItem('mode');
    const themeLink = document.getElementById('theme-link');
    if (savedMode === '../css_dark') {
        themeLink.setAttribute('href', '../css_dark.css');
        document.querySelector('.mode-toggle').innerHTML = '🌙';
    } else {
        themeLink.setAttribute('href', '../css_light.css');
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