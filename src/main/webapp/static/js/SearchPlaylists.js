document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('#whatListen input.search-input');
    const playlistBooks = document.querySelectorAll('.playlist-book');
    const playlistBookshelf = document.querySelector('.playlist-bookshelf');

    // Store original playlist display for reset
    const originalDisplay = Array.from(playlistBooks).map(book => ({
        element: book,
        display: window.getComputedStyle(book).display
    }));

    // Only activate search when the user clicks and clears placeholder
    searchInput.addEventListener('focus', function() {
        if (this.value === this.getAttribute('placeholder')) {
            this.value = '';
        }
    });

    // Reset to placeholder if left empty
    searchInput.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = this.getAttribute('placeholder');
            resetSearch();
        }
    });

    // Live search on input
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();

        // Skip search if field is empty or contains placeholder
        if (searchTerm === '' || searchTerm === this.getAttribute('placeholder').toLowerCase()) {
            resetSearch();
            return;
        }

        let matchFound = false;

        // Search through all playlists
        playlistBooks.forEach(book => {
            const playlistName = book.querySelector('.playlist-name').textContent.toLowerCase();
            const songElements = book.querySelectorAll('.book-pages .page-line');
            let songMatches = false;

            // Check if any song in the playlist matches
            songElements.forEach(song => {
                if (song.textContent.toLowerCase().includes(searchTerm)) {
                    songMatches = true;
                }
            });

            // Show/hide based on match
            if (playlistName.includes(searchTerm) || songMatches) {
                book.style.display = 'inline-block';
                matchFound = true;
            } else {
                book.style.display = 'none';
            }
        });

        // Show "no results" message if needed
        showNoResultsMessage(matchFound, searchTerm);
    });

    function resetSearch() {
        // Restore original display states
        originalDisplay.forEach(item => {
            item.element.style.display = item.display;
        });

        // Remove any "no results" message
        const noResultsMsg = document.querySelector('.no-results-message');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    function showNoResultsMessage(matchFound, searchTerm) {
        // Remove any existing message
        const existingMsg = document.querySelector('.no-results-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Add message if no matches found
        if (!matchFound) {
            const message = document.createElement('div');
            message.className = 'no-results-message';
            message.textContent = `No playlists found with the name "${searchTerm}"`;
            message.style.textAlign = 'center';
            message.style.padding = '20px';
            message.style.color = '#fff';
            message.style.fontWeight = 'bold';
            message.style.fontSize = '18px';
            message.style.fontFamily = 'Arial, sans-serif';

            // Insert after playlist bookshelf
            playlistBookshelf.parentNode.insertBefore(message, playlistBookshelf.nextSibling);
        }
    }
});