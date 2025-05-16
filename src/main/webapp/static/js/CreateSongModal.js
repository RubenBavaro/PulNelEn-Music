document.addEventListener('DOMContentLoaded', function() {
  // --- Elements for playlist creation ---
  const createButton       = document.querySelector('.button');
  const playlistNameInput  = document.querySelector('.list input');
  const playlistBookshelf  = document.querySelector('.playlist-bookshelf');

  // --- Elements for song‐search and modals ---
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => {
    input.addEventListener('click', function() {
      if (this.value === this.getAttribute('placeholder')) this.value = '';
      if (this.placeholder === 'Seleziona la canzone da aggiungere') showCreateSongModal();
    });
    input.addEventListener('blur', function() {
      if (this.value === '') this.value = this.getAttribute('placeholder');
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

  // Create Playlist-selection modal
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

  // In-memory playlists
  let playlists = [
    { name: '4ITIA-A',    songs: ['OLLY - Balorda Nostalgia', 'Tony Effe - Damme \'na mano', 'Giorgia - La cura per me'] },
    { name: 'Workout Mix', songs: ['Battito - Fedez'] },
    { name: 'Chill Vibes', songs: [] }
  ];

  // Redraw bookshelf
  function renderBookshelf() {
    playlistBookshelf.innerHTML = '';
    playlists.forEach(pl => {
      const book = document.createElement('div');
      book.className = 'playlist-book';
      book.style.display = 'inline-block';
      book.style.margin = '0 10px';

      const pagesInner = pl.songs.length > 0
          ? pl.songs.map(song => `<div class="page-line">${song}</div>`).join('')
          : '<div class="no-songs">Nessuna canzone</div>';

      book.innerHTML = `
        <div class="book-spine">
          <span class="playlist-name">${pl.name}</span>
          <span class="playlist-details">${pl.songs.length} songs</span>
        </div>
        <div class="book-pages">
          ${pagesInner}
        </div>
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

  // Playlist creation
  createButton.addEventListener('click', async function(e) {
    e.preventDefault();
    const name = playlistNameInput.value.trim();
    if (!name) return alert('Per favore inserisci un nome per la playlist');
    try {
      const res = await fetch('api/playlist', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, songs: [] }) });
      if (!res.ok) throw new Error(res.statusText);
      await res.json();
      playlists.push({ name, songs: [] });
      renderBookshelf();
      playlistNameInput.value = '';
      alert(`Playlist "${name}" creata con successo!`);
    } catch {
      alert('Errore durante la creazione della playlist');
    }
  });

  // Song-creation modal logic
  function showCreateSongModal() { songModal.style.display = 'block'; document.body.classList.add('modal-open'); }
  function closeCreateSongModal() { songModal.style.display = 'none'; document.body.classList.remove('modal-open'); }
  document.getElementById('createSongBtn').addEventListener('click', () => {
    const title  = document.getElementById('songTitle').value.trim();
    const author = document.getElementById('songAuthor').value.trim();
    const genre  = document.getElementById('songGenre').value.trim();
    if (!title || !author || !genre) return alert('Per favore compila tutti i campi');
    addNewSongToList(title, author, genre);
    closeCreateSongModal();
  });

  // +ADD button → open playlist-selection modal
  document.addEventListener('click', e => {
    if (e.target.classList.contains('aggiungi')) {
      showSelectPlaylistModal({
        title:  e.target.dataset.title,
        artist: e.target.dataset.artist,
        genre:  e.target.dataset.genre
      });
    }
  });

  function showSelectPlaylistModal(songData) {
    const list = document.getElementById('playlistList');
    list.innerHTML = '';
    playlists.forEach(pl => {
      const present = pl.songs.some(s => s.toLowerCase() === `${songData.title} - ${songData.artist}`.toLowerCase());
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
      btn.addEventListener('click', function() {
        // clear modal list at start of add
        document.getElementById('playlistList').innerHTML = '';
        const playlistName = this.dataset.playlist;
        const fullTitle = `${songData.title} - ${songData.artist}`;
        const target = playlists.find(p => p.name === playlistName);
        target.songs.push(fullTitle);
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
    document.getElementById('playlistList').innerHTML = '';
    playlistModal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  function addNewSongToList(title, author, genre) {
    const songContainer = document.querySelector('.col-2.offset-1');
    const newSong = document.createElement('div');
    newSong.className = 'addSong';
    newSong.innerHTML = `
      <div class="cover"><img src="static/img/coverSong.png"></div>
      <div class="songName">${title} • </div>
      <div class="songArtist">${author}</div>
      <div class="aggiungi" data-title="${title}" data-artist="${author}" data-genre="${genre}">+ADD</div>
    `;
    const btnContainer = document.querySelector('.button').parentElement;
    btnContainer.insertBefore(newSong, createButton);
  }
});
