function toggleRemove(moreButton) {
    var removeButton = moreButton.closest('.addedSongs').nextElementSibling;
    
    if (removeButton.style.display === 'none' || removeButton.style.display === '') {
        removeButton.style.display = 'flex';
    } else {
        removeButton.style.display = 'none';
    }
}

function removeSong(removeButton) {
    var songElement = removeButton.previousElementSibling;
    songElement.remove();
    removeButton.remove();
}
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('click', function() {
            if (this.value === this.getAttribute('placeholder')) {
                this.value = '';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = this.getAttribute('placeholder');
            }
        });
    });
});

    const navbarToggle = document.getElementById('navbarToggle');
    const navbarDropdown = document.getElementById('navbarDropdown');
    
    navbarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navbarDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function(e) {
        if (!navbarDropdown.contains(e.target) && !navbarToggle.contains(e.target)) {
            navbarDropdown.classList.remove('show');
        }
    });

let loginStatus = localStorage.getItem("storageName");




window.addEventListener("DOMContentLoaded", () => {

    const logInDiv = document.getElementById("logIn");
    const logInLink = document.querySelector("a[href='login.html']");

    if (loginStatus === "true") {
            fetch("getUser")
                .then(r => r.text())
                .then(username => {
                    if (username==="Log In"){
                        loginStatus = false;
                    } else {
                        if (logInLink) {
                            console.log("logged in")
                            logInLink.removeAttribute("href");
                            logInLink.style.cursor = "default";
                        }
                        logInDiv.innerHTML = `
                        <span class="username">${username}</span>
                        <img src="static/img/account_circle.png" alt="Account">`;
                    }
                })
                .catch(err => console.error("Failed to fetch user:", err));
    } else {
        console.log("User is not logged in");
    }
});


document.addEventListener('DOMContentLoaded', function() {
    let playlistModal = document.querySelector('.playlist-modal');
    if (!playlistModal) {
        playlistModal = document.createElement('div');
        playlistModal.className = 'playlist-modal';
        document.body.appendChild(playlistModal);
    }
    
    // Set up event listeners for playlist books
    const playlistBooks = document.querySelectorAll('.playlist-book');
    
    playlistBooks.forEach(book => {
        book.addEventListener('click', function(e) {
            e.stopPropagation();
            const playlistName = this.querySelector('.playlist-name').textContent;
            
            // In a real implementation, this would fetch from your backend
            // For now, we'll use the example data from the playlist book
            const mockSongs = [
                { 
                    title: "OLLY - Balorda Nostalgia", 
                    artist: "OLLY", 
                    genre: "Power ballad pop", 
                    coverPath: "static/img/coverSong1.png" 
                },
                { 
                    title: "Tony Effe – Damme 'na mano", 
                    artist: "Tony Effe", 
                    genre: "Pop", 
                    coverPath: "static/img/coverSong1.png" 
                },
                { 
                    title: "Giorgia – La cura per me", 
                    artist: "Giorgia", 
                    genre: "Pop", 
                    coverPath: "static/img/coverSong1.png" 
                }
            ];
            
            // Instead of making an actual API call, we'll use the mock data
            // In a real implementation, you would use the fetch API:
            /*
            fetch(`/api/playlist?name=${encodeURIComponent(playlistName)}`)
                .then(response => response.json())
                .then(songs => {
                    showPlaylistSongs(playlistName, songs);
                })
                .catch(error => console.error('Error:', error));
            */
            
            showPlaylistSongs(playlistName, mockSongs);
        });
    });
    
    // Close modal when clicking outside the content
    document.addEventListener('click', function(e) {
        if (playlistModal.classList.contains('active') && 
            !e.target.closest('.modal-content') &&
            !e.target.closest('.playlist-book')) {
            playlistModal.classList.remove('active');
        }
    });
    
    // Handle ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && playlistModal.classList.contains('active')) {
            playlistModal.classList.remove('active');
        }
    });
});

// Function to show playlist songs in modal
function showPlaylistSongs(playlistName, songs) {
    const modal = document.querySelector('.playlist-modal');
    
    // Clear previous content and create new modal structure
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${playlistName}</h3>
            <div class="songs-container"></div>
            <button class="close-modal">&times;</button>
        </div>
    `;
    
    // Add songs to the container
    const container = modal.querySelector('.songs-container');
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'modal-song-card';
        songElement.innerHTML = `
            <div class="song-cover">
                <img src="${song.coverPath || 'static/img/coverSong.png'}" alt="${song.title}">
            </div>
            <div class="song-info">
                <div class="song-name">${song.title}</div>
                <div class="song-artist">${song.artist || 'Unknown Artist'}</div>
                <div class="song-genre">${song.genre || 'Unknown Genre'}</div>
            </div>
        `;
        container.appendChild(songElement);
    });
    
    // Show modal
    modal.classList.add('active');
    
    // Add close button functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
}