// Debugging initialization with more verbose output
console.log("⚙️ Initializing improved removeSong.js");

// Ensure global function availability
window.toggleRemove = function(moreButton) {
    console.log("🎚️ toggleRemove called with:", moreButton);

    // Validate input
    if (!moreButton) {
        console.error("❌ toggleRemove called without button reference");
        return;
    }

    // Find the related remove button
    const addedSongsDiv = moreButton.closest('.addedSongs');
    if (!addedSongsDiv) {
        console.error("❌ Could not find parent .addedSongs element");
        return;
    }

    const removeButton = addedSongsDiv.nextElementSibling;
    if (!removeButton || !removeButton.classList.contains('remove')) {
        console.error("❌ Could not find next sibling .remove element");
        return;
    }

    console.log("🔍 Found remove button:", removeButton);

    // First hide all other remove buttons
    document.querySelectorAll('.remove').forEach(btn => {
        if (btn !== removeButton) {
            btn.style.display = 'none';
        }
    });

    // Toggle this specific remove button
    if (removeButton.style.display === 'flex' || removeButton.style.display === 'block') {
        removeButton.style.display = 'none';
        console.log("🙈 Hiding remove button");
    } else {
        removeButton.style.display = 'flex';
        console.log("👁️ Showing remove button");
    }
};

window.removeSong = function(removeButton) {
    console.log("🚀 removeSong initiated with:", removeButton);

    // Validate input
    if (!removeButton) {
        console.error("❌ removeSong called without button reference");
        return;
    }

    // Find critical elements
    const songContainer = removeButton.closest('[data-playlist-name]');
    if (!songContainer) {
        console.error("❌ Could not find parent container with data-playlist-name attribute");

        // Alternative method: try to find by going up from the remove button
        const parentDiv = removeButton.parentElement;
        console.log("Trying alternative parent lookup:", parentDiv);
        if (!parentDiv) {
            console.error("❌ Failed to find any parent element");
            return;
        }

        // Use this parent instead
        const songDiv = parentDiv.querySelector(".addedSongs");
        const nameElement = songDiv ? songDiv.querySelector(".nameSong") : null;

        if (!nameElement) {
            console.error("❌ Failed to find song name element");
            return;
        }

        const songName = nameElement.textContent.trim();
        const playlistContainer = document.querySelector('.playlist-book');
        const playlistName = playlistContainer ?
            playlistContainer.querySelector('.playlist-name').textContent :
            'Unknown Playlist';

        console.log("Using fallback method - found song:", songName, "in playlist:", playlistName);

        // Make the API call
        console.log("📤 Sending removal request with fallback method");

        // Before API call, apply visual effect to show something is happening
        parentDiv.style.opacity = "0.5";
        parentDiv.style.transition = "opacity 0.3s";

        fetch("removeSong", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                name: playlistName,
                song: songName
            })
        })
            .then(res => {
                console.log("📥 Server response:", res.status, res.statusText);
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.text();
            })
            .then(message => {
                console.log("✅ Success message:", message);

                // Try different removal approaches to ensure it works
                if (parentDiv.parentElement) {
                    console.log("🗑️ Removing entire parent div", parentDiv);
                    parentDiv.remove();
                } else {
                    console.log("⚠️ Parent already removed from DOM");
                }

                // Also update the song count
                const countElement = document.querySelector('.playlist-details');
                if (countElement) {
                    const count = parseInt(countElement.textContent) || 0;
                    countElement.textContent = `${Math.max(0, count - 1)} songs`;
                }
            })
            .catch(err => {
                console.error("❌ Error:", err);
                parentDiv.style.opacity = "1"; // Restore if failed
                alert("Failed to remove song. Please try again.");
            });

        return;
    }

    // Get the song data from the container
    const addedSongsDiv = songContainer.querySelector('.addedSongs');
    if (!addedSongsDiv) {
        console.error("❌ Could not find .addedSongs inside container");
        return;
    }

    const songNameElement = addedSongsDiv.querySelector('.nameSong');
    if (!songNameElement) {
        console.error("❌ Could not find .nameSong element");
        return;
    }

    const songName = songNameElement.textContent.trim();
    const playlistName = songContainer.dataset.playlistName;

    console.log("📝 Found song for removal:", {
        songName,
        playlistName,
        container: songContainer
    });

    // Apply visual effect immediately
    songContainer.style.opacity = "0.5";
    songContainer.style.transition = "opacity 0.3s";

    // Make the API call
    console.log("📤 Sending removal request");

    fetch("removeSong", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            name: playlistName,
            song: songName
        })
    })
        .then(res => {
            console.log("📥 Server response:", res.status, res.statusText);
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            return res.text();
        })
        .then(message => {
            console.log("✅ Success message:", message);

            // Remove the song container
            songContainer.remove();
            console.log("🗑️ Element removed from DOM");

            // Update playlist song count
            const playlistBook = document.querySelector('.playlist-book');
            if (playlistBook) {
                const countElement = playlistBook.querySelector('.playlist-details');
                if (countElement) {
                    const count = parseInt(countElement.textContent) || 0;
                    countElement.textContent = `${Math.max(0, count - 1)} songs`;
                    console.log("🔢 Updated song count to", Math.max(0, count - 1));
                }
            }
        })
        .catch(err => {
            console.error("❌ Error:", err);
            songContainer.style.opacity = "1"; // Restore if failed
            alert("Failed to remove song. Please try again.");
        });
};

// Handler for modal remove buttons
window.handleModalRemove = function(removeButton, playlistName, songTitle) {
    console.log("🚀 Modal song removal initiated for:", songTitle, "in playlist:", playlistName);

    // Find container element
    const songElement = removeButton.closest('.modal-song-card');
    if (!songElement) {
        console.error("❌ Could not find parent .modal-song-card");
        return;
    }

    // Find container and modal
    const container = songElement.parentElement;
    const modal = container.closest('.playlist-modal active');

    // Visual feedback before DOM removal
    songElement.style.transition = 'opacity 0.3s';
    songElement.style.opacity = '0.5';

    // Define internal playlists var if it exists in external scope
    const playlists = window.playlists || [];

    // Update data if available
    const playlist = playlists.find?.(p => p.name === playlistName);
    if (playlist) {
        const initialLength = playlist.songs.length;
        playlist.songs = playlist.songs.filter(s =>
            s.title !== songTitle &&
            (!s.fullTitle || s.fullTitle !== songTitle)
        );
        console.log(`Data update: ${initialLength} → ${playlist.songs.length} songs`);
    }

    // Server call with error handling
    fetch("removeSong", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            name: playlistName,
            song: songTitle
        })
    })
        .then(res => {
            console.log("📥 Server response:", res.status, res.statusText);
            if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            return res.text();
        })
        .then(message => {
            console.log("✅ Success message:", message);

            // Remove from DOM
            if (songElement.parentNode) {
                songElement.remove();
                console.log("🗑️ DOM removal complete");

                // Update main display if renderBookshelf function exists
                if (typeof window.renderBookshelf === 'function') {
                    console.log("📊 Updating bookshelf display");
                    window.renderBookshelf();
                } else {
                    console.log("⚠️ renderBookshelf function not found, visual update may be incomplete");

                    // Fallback - update playlist book counts directly
                    const bookElements = document.querySelectorAll('.playlist-book');
                    bookElements.forEach(book => {
                        const nameEl = book.querySelector('.playlist-name');
                        if (nameEl && nameEl.textContent === playlistName) {
                            const countEl = book.querySelector('.playlist-details');
                            if (countEl) {
                                const currentCount = parseInt(countEl.textContent) || 0;
                                countEl.textContent = `${Math.max(0, currentCount - 1)} songs`;
                            }
                        }
                    });
                }

                // Close modal if empty
                if (container.children.length === 0 && modal) {
                    modal.classList.remove('active');
                    console.log("🚪 Closed empty modal");
                }
            } else {
                console.warn("⚠️ Element already removed from DOM");
            }
        })
        .catch(err => {
            console.error("❌ Server error:", err);
            // Rollback visual changes on failure
            songElement.style.opacity = '1';
            alert(`Removal failed: ${err.message}`);
        });
};

// Set up event listeners using event delegation
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 DOM loaded - setting up improved event listeners");

    // Single event listener for the entire document
    document.addEventListener('click', function(event) {
        // Debug what was clicked
        console.log("👆 Click detected on:", event.target);

        // Handle more button clicks
        if (event.target.classList.contains('more')) {
            console.log("🔘 More button clicked");
            event.stopPropagation();
            window.toggleRemove(event.target);
        }

        // Handle remove button clicks in playlist view
        if (event.target.classList.contains('remove')) {
            console.log("❎ Remove button clicked");
            event.stopPropagation();
            window.removeSong(event.target);
        }

        // Handle modal remove button clicks
        if (event.target.classList.contains('remove-song')) {
            console.log("❎ Modal remove button clicked");
            event.stopPropagation();

            // Find necessary data
            const songCard = event.target.closest('.modal-song-card');
            if (!songCard) {
                console.error("❌ Could not find parent song card");
                return;
            }

            const songNameElement = songCard.querySelector('.song-name');
            if (!songNameElement) {
                console.error("❌ Could not find song name element");
                return;
            }

            const songTitle = songNameElement.textContent.trim();
            const modalContent = songCard.closest('.modal-content');

            if (!modalContent) {
                console.error("❌ Could not find modal content");
                return;
            }

            const playlistNameElement = modalContent.querySelector('h3');
            const playlistName = playlistNameElement ? playlistNameElement.textContent.trim() : 'Unknown Playlist';

            console.log("📝 Removing song:", songTitle, "from playlist:", playlistName);
            window.handleModalRemove(event.target, playlistName, songTitle);
        }
    });

    console.log("✅ Event listeners successfully attached");
});

// Add direct inspection of DOM on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log("🔍 Inspecting DOM structure for debugging:");

        // Check for playlist books
        const books = document.querySelectorAll('.playlist-book');
        console.log(`Found ${books.length} playlist books`);

        // Check for song elements
        const songs = document.querySelectorAll('.addedSongs');
        console.log(`Found ${songs.length} song elements`);

        // Check for remove buttons
        const removeButtons = document.querySelectorAll('.remove');
        console.log(`Found ${removeButtons.length} remove buttons`);

        // Inspect first song structure
        if (songs.length > 0) {
            console.log("First song structure:", songs[0]);
            console.log("Parent element:", songs[0].parentElement);
            console.log("Next sibling:", songs[0].nextElementSibling);
        }
    }, 1000); // Delay to ensure everything is loaded
});

console.log("✅ Improved removeSong.js loaded successfully");