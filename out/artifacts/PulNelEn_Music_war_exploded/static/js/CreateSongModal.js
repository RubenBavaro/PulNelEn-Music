document.addEventListener('DOMContentLoaded', function() {
  // --- Elements for playlist creation ---
  const createButton       = document.querySelector('.button');
  const playlistNameInput  = document.querySelector('.list input');
  const playlistBookshelf  = document.querySelector('.playlist-bookshelf');

  // --- Elements for song‐search and modals ---
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => {
    input.addEventListener('click', function() {
      if (this.value === this.getAttribute('placeholder')) {
        this.value = '';
      }
      if (this.placeholder === 'Seleziona la canzone da aggiungere') {
        showCreateSongModal();
      }
    });
    input.addEventListener('blur', function() {
      if (this.value === '') {
        this.value = this.getAttribute('placeholder');
      }
    });
  });

  // Create Song modal
  const songModal = document.createElement('div');
  songModal.id = 'createSongModal';
  songModal.className = 'create-song-modal';
  songModal.innerHTML = `
    <div class="create-song-modal-content">
      <span class="close-modal">&times;</span>
      <h2>Crea una nuova canzone</h2>
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
  document.body.appendChild(songModal);

  // Create Playlist‐selection modal
  const playlistModal = document.createElement('div');
  playlistModal.id = 'selectPlaylistModal';
  playlistModal.className = 'select-playlist-modal';
  playlistModal.innerHTML = `
    <div class="select-playlist-modal-content">
      <span class="close-modal">&times;</span>
      <h2>Seleziona Playlist</h2>
      <div id="playlistList" class="playlist-grid"></div>
    </div>
  `;
  document.body.appendChild(playlistModal);

  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeCreateSongModal();
      closeSelectPlaylistModal();
    });
  });
  window.addEventListener('click', e => {
    if (e.target === songModal) closeCreateSongModal();
    if (e.target === playlistModal) closeSelectPlaylistModal();
  });

  // In‐memory playlists (will be synced on create and on add‐song)
  let playlists = [
    { name: '4ITIA-A',    songs: ['OLLY - Balorda Nostalgia', 'Tony Effe – Damme \'na mano', 'Giorgia – La cura per me'] },
    { name: 'Workout Mix', songs: ['Battito - Fedez'] },
    { name: 'Chill Vibes', songs: [] }
  ];

  // Utility: redraw the bookshelf from `playlists`
  function renderBookshelf() {
    playlistBookshelf.innerHTML = '';
    playlists.forEach(pl => {
      const book = document.createElement('div');
      book.className = 'playlist-book';
      book.style.display = 'inline-block';
      book.style.margin = '0 10px';
      book.innerHTML = `
        <div class="book-spine">
          <span class="playlist-name">${pl.name}</span>
          <span class="playlist-details">${pl.songs.length} songs</span>
        </div>
        <div class="book-pages"></div>
      `;
      book.addEventListener('click', e => {
        e.stopPropagation();
        showPlaylistSongs(pl.name, pl.songs.map(t => {
          const [title, artist] = t.split(' - ');
          return { title, artist, genre: 'Unknown', coverPath: 'static/img/coverSong1.png' };
        }));
      });
      playlistBookshelf.appendChild(book);
    });
  }
  renderBookshelf();

  // -------------------------------------------------------
  // 1) Playlist Creation via backend
  // -------------------------------------------------------
  createButton.addEventListener('click', async function(e) {
    e.preventDefault();
    const name = playlistNameInput.value.trim();
    if (!name) return alert('Per favore inserisci un nome per la playlist');

    try {
      const res = await fetch('api/playlist', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, songs: [] })
      });
      if (!res.ok) throw new Error(res.statusText);
      await res.json();  // our servlet returns []
      // locally update & re-render
      playlists.push({ name, songs: [] });
      renderBookshelf();
      playlistNameInput.value = '';
      alert(`Playlist "${name}" creata con successo!`);
    } catch (err) {
      console.error(err);
      alert('Errore durante la creazione della playlist');
    }
  });

  // -------------------------------------------------------
  // 2) Song‐creation modal logic
  // -------------------------------------------------------
  function showCreateSongModal() {
    songModal.style.display = 'block';
    document.body.classList.add('modal-open');
  }
  function closeCreateSongModal() {
    songModal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
  document.getElementById('createSongBtn').addEventListener('click', () => {
    const title  = document.getElementById('songTitle').value.trim();
    const author = document.getElementById('songAuthor').value.trim();
    const genre  = document.getElementById('songGenre').value.trim();
    if (!title || !author || !genre) {
      return alert('Per favore compila tutti i campi');
    }
    addNewSongToList(title, author, genre);
    closeCreateSongModal();
    document.getElementById('songTitle').value = '';
    document.getElementById('songAuthor').value = '';
    document.getElementById('songGenre').value = '';
  });

  // -------------------------------------------------------
  // 3) +ADD button clicks → open playlist‐selection modal
  // -------------------------------------------------------
  document.addEventListener('click', e => {
    if (e.target.classList.contains('aggiungi')) {
      const btn = e.target;
      showSelectPlaylistModal({
        title:  btn.dataset.title,
        artist: btn.dataset.artist,
        genre:  btn.dataset.genre
      });
    }
  });

  function showSelectPlaylistModal(songData) {
    const list = document.getElementById('playlistList');
    list.innerHTML = '';
    playlists.forEach(pl => {
      const present = pl.songs
        .some(s => s.toLowerCase() === `${songData.title} - ${songData.artist}`.toLowerCase());
      const item = document.createElement('div');
      item.className = 'playlist-modal-item';
      item.innerHTML = `
        <div class="playlist-info">
          <div class="playlist-name">${pl.name}</div>
          <div class="playlist-song-count">${pl.songs.length} songs</div>
        </div>
        <button class="add-to-playlist" data-playlist="${pl.name}" ${present? 'disabled':''}>
          ${present? 'Già Presente':'Aggiungi'}
        </button>
      `;
      const btn = item.querySelector('button');
      btn.addEventListener('click', async function() {
        const playlistName = this.dataset.playlist;
        const fullTitle = `${songData.title} - ${songData.artist}`;

        // 3a) update backend via (hypothetical) API call
        // await fetch(`api/playlist/${encodeURIComponent(playlistName)}/add`, {
        //   method:'POST', headers:{'Content-Type':'application/json'},
        //   body: JSON.stringify({ song: fullTitle })
        // });

        // 3b) update local model & UI
        pl.songs.push(fullTitle);
        renderBookshelf();
        this.disabled = true;
        this.textContent = 'Già Presente';
        alert(`"${songData.title}" aggiunta a "${playlistName}"`);
        closeSelectPlaylistModal();
      });
      list.appendChild(item);
    });

    playlistModal.style.display = 'block';
    document.body.classList.add('modal-open');
  }
  function closeSelectPlaylistModal() {
    playlistModal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  // -------------------------------------------------------
  // 4) Helper to insert newly created song into the list
  // -------------------------------------------------------
  function addNewSongToList(title, author, genre) {
    const songContainer = document.querySelector('.col-2.offset-1');
    const newSong = document.createElement('div');
    newSong.className = 'addSong';
    newSong.innerHTML = `
      <div class="cover"><img src="static/img/coverSong.png"></div> 
      <div class="songName">${title} • </div>
      <div class="songArtist">${author}</div>
      <div class="aggiungi"
           data-title="${title}"
           data-artist="${author}"
           data-genre="${genre}">
        +ADD
      </div>
    `;
    const btnContainer = document.querySelector('.button').parentElement;
    btnContainer.insertBefore(newSong, createButton);
  }
});