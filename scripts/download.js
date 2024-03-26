function confirmDownload() {
    // Display a confirmation dialog
    if (confirm("Do you really want to download this file?")) {
        return true; // Proceed with the download
    } else {
        return false; // Cancel the download
    }
}