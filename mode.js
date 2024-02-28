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

// Check for mode in localStorage on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedMode = localStorage.getItem('mode');
    const themeLink = document.getElementById('theme-link');
    if (savedMode === '../css_dark') {
        themeLink.setAttribute('href', '../css_dark.css');
        document.querySelector('.mode-toggle').innerHTML = '🌙';
    } else if (savedMode === '../css_light') {
        themeLink.setAttribute('href', '../css_light.css');
        document.querySelector('.mode-toggle').innerHTML = '☀️';
    } else {
        // If no mode is saved, set the default mode to light
        themeLink.setAttribute('href', '../css_light.css');
        document.querySelector('.mode-toggle').innerHTML = '☀️';
    }
});