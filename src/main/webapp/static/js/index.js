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
    
    const playlistBooks = document.querySelectorAll('.playlist-book');
    
    playlistBooks.forEach(book => {
        book.addEventListener('click', function(e) {
            e.stopPropagation();
            const playlistName = this.querySelector('.playlist-name').textContent;
            
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
            
            
            showPlaylistSongs(playlistName, mockSongs);
        });
    });
    
    document.addEventListener('click', function(e) {
        if (playlistModal.classList.contains('active') && 
            !e.target.closest('.modal-content') &&
            !e.target.closest('.playlist-book')) {
            playlistModal.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && playlistModal.classList.contains('active')) {
            playlistModal.classList.remove('active');
        }
    });
});

function showPlaylistSongs(playlistName, songs) {
    const modal = document.querySelector('.playlist-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${playlistName}</h3>
            <div class="songs-container"></div>
            <button class="close-modal">&times;</button>
        </div>
    `;
    
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
    
    modal.classList.add('active');
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
}