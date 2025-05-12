document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('click', function() {
            if (this.value === this.getAttribute('placeholder')) {
                this.value = '';
            }

            if (this.placeholder === "Seleziona la canzone da aggiungere") {
                showCreateSongModal();
            }else{
                
            }
        });

        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = this.getAttribute('placeholder');
            }
        });
    });

    // Create and add the song creation modal to the DOM
    const modal = document.createElement('div');
    modal.id = 'createSongModal';
    modal.className = 'create-song-modal';
    modal.innerHTML = `
        <div class="create-song-modal-content">
            <span class="close-modal">&times;</span>
            <h2>Crea Una Nuova Canzone</h2>
            <div class="form-group">
                <label for="songTitle">Titolo Canzone:</label>
                <input type="text" id="songTitle" placeholder="Inserisci il titolo della canzone">
            </div>
            <div class="form-group">
                <label for="songAuthor">Autore/Artista:</label>
                <input type="text" id="songAuthor" placeholder="Inserisci l'autore o l'artista">
            </div>
            <div class="form-group">
                <label for="songGenre">Genere:</label>
                <input type="text" id="songGenre" placeholder="Inserisci il genere musicale">
            </div>
            <button id="createSongBtn">Crea la canzone</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal when clicking on X
    document.querySelector('.close-modal').addEventListener('click', function() {
        closeCreateSongModal();
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('createSongModal')) {
            closeCreateSongModal();
        }
    });

    // Create song button functionality
    document.getElementById('createSongBtn').addEventListener('click', function() {
        const title = document.getElementById('songTitle').value;
        const author = document.getElementById('songAuthor').value;
        const genre = document.getElementById('songGenre').value;

        if (title && author && genre) {
            addNewSongToList(title, author, genre);
            closeCreateSongModal();

            // Clear the form
            document.getElementById('songTitle').value = '';
            document.getElementById('songAuthor').value = '';
            document.getElementById('songGenre').value = '';
        } else {
            alert('Per favore compila tutti i campi');
        }
    });
});

function showCreateSongModal() {
    const modal = document.getElementById('createSongModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeCreateSongModal() {
    const modal = document.getElementById('createSongModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function addNewSongToList(title, author, genre) {
    // Create a new song element
    const songContainer = document.querySelector('.col-2.offset-1');
    const newSong = document.createElement('div');
    newSong.className = 'addSong';
    newSong.innerHTML = `
        <div class="cover"><img src="static/img/coverSong.png"></div> 
        <div class="songName">${title} • </div>
        <div class="songArtist"> ${author}</div>
        <div class="aggiungi" data-title="${title}" data-artist="${author}" data-genre="${genre}">+ADD</div>
    `;

    // Insert new song before the "CREA" button
    const buttonContainer = document.querySelector('.button').parentElement;
    buttonContainer.insertBefore(newSong, document.querySelector('.button'));

    // Add click event for the new +ADD button
    const addButton = newSong.querySelector('.aggiungi');
    addButton.addEventListener('click', function() {
        const title = this.dataset.title;
        const artist = this.dataset.artist;
        const genre = this.dataset.genre;
        const playlistName = document.querySelector(".list input").value;

        // Send a POST request to add the song to the playlist
        fetch("/api/playlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                name: playlistName,
                song: title,
                artist: artist,
                genre: genre
            })
        })
            .then(res => res.json())
            .then(data => {
                if(data.status === "success") {
                    // Add the song to the UI
                    addSongToPlaylist(title, artist, genre);
                    alert(`"${title}" è stato aggiunto alla playlist "${playlistName}"`);
                } else {
                    alert('Errore durante l\'aggiunta della canzone alla playlist');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // For demonstration, add the song to UI even if fetch fails
                addSongToPlaylist(title, artist, genre);
            });
    });
}

function addSongToPlaylist(title, artist, genre) {
    // Create a wrapper div for the song and remove button
    const wrapper = document.createElement('div');
    wrapper.className = 'col-2';
    wrapper.style.position = 'relative';

    // Create the song element
    const newSong = document.createElement('div');
    newSong.className = 'addedSongs';
    newSong.style.marginLeft = '20px';
    newSong.innerHTML = `
        <div class="songCover"><img src="static/img/coverSong1.png"></div>
        <div class="nameSong">${title}</div>
        <div class="genreSong">${genre}</div>
        <img src="static/img/more.png" class="more" onclick="toggleRemove(this)">
    `;

    // Create the remove button
    const removeBtn = document.createElement('div');
    removeBtn.className = 'remove';
    removeBtn.textContent = 'Rimuovi';
    removeBtn.onclick = function() { removeSong(this); };

    // Add elements to the wrapper
    wrapper.appendChild(newSong);
    wrapper.appendChild(removeBtn);

    // Add the wrapper to the playlist container
    const bookPages = document.querySelector('.book-pages');
    bookPages.appendChild(wrapper);

    // Update playlist count
    const playlistDetails = document.querySelector('.playlist-details');
    const currentCount = parseInt(playlistDetails.textContent);
    if (!isNaN(currentCount)) {
        const newCount = currentCount + 1;
        playlistDetails.textContent = `${newCount} songs`;
    }
}