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
    {
      name: '4ITIA-A',
      songs: [
        { title: 'OLLY - Balorda Nostalgia', artist: 'OLLY', genre: 'Power ballad pop' },
        { title: 'Tony Effe - Damme \'na mano', artist: 'Tony Effe', genre: 'Pop' },
        { title: 'Giorgia - La cura per me', artist: 'Giorgia', genre: 'Pop' }
      ]
    },
    {
      name: 'Workout Mix',
      songs: [{ title: 'Battito - Fedez', artist: 'Fedez', genre: 'Pop' }]
    },
    {
      name: 'Chill Vibes',
      songs: []
    }
  ];

  // Redraw bookshelf
  globalThis.renderBookshelf = function renderBookshelf() {
    playlistBookshelf.innerHTML = '';
    playlists.forEach(pl => {
      const book = document.createElement('div');
      book.className = 'playlist-book';
      book.style.display = 'inline-block';
      book.style.margin = '0 10px';

      const pagesInner = pl.songs.length > 0
          ? pl.songs.map(song => `<div class="page-line">${song.title}</div>`).join('')
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
        showPlaylistSongs(pl.name, pl.songs.map(song => {
          return {
            title: song.title,
            artist: song.artist || 'Unknown Artist',
            genre: song.genre || 'Pop',
            coverPath: 'static/img/coverSong1.png'
          };
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
      console.log(`Playlist "${name}" creata con successo!`);
    } catch {
      console.log('Errore durante la creazione della playlist');
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
        genre:  e.target.dataset.genre || 'Pop'
      });
    }
  });

  function showSelectPlaylistModal(songData) {
    const list = document.getElementById('playlistList');
    list.innerHTML = '';
    playlists.forEach(pl => {
      const fullTitle = `${songData.title} - ${songData.artist}`;
      const present = pl.songs.some(s => s.title.toLowerCase() === fullTitle.toLowerCase());
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
        target.songs.push({
          title: fullTitle,
          artist: songData.artist,
          genre: songData.genre || 'Pop'
        });
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

  // --- REMOVAL FUNCTIONS (structured like add functions) ---

  // Remove song from playlist (similar to add function structure)
  function removeSongFromPlaylist(playlistName, songTitle) {
    console.log("🚀 removeSongFromPlaylist called:", playlistName, songTitle);

    // Find the target playlist in our in-memory array
    const targetPlaylist = playlists.find(p => p.name === playlistName);
    if (!targetPlaylist) {
      console.error("❌ Playlist not found:", playlistName);
      return Promise.reject(new Error('Playlist not found'));
    }

    console.log("📝 Before removal:", targetPlaylist.songs.length, "songs");

    // Make API call to server
    return fetch("removeSong", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: playlistName,
        song: songTitle
      })
    })
        .then(res => {
          console.log("📥 Server response:", res.status, res.statusText);
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
          return res.text();
        })
        .then(message => {
          console.log("✅ Server success:", message);

          // Remove from in-memory array (like add function does it)
          const initialLength = targetPlaylist.songs.length;
          targetPlaylist.songs = targetPlaylist.songs.filter(song => {
            // Handle different possible title formats
            const matches = song.title === songTitle ||
                song.title.includes(songTitle) ||
                songTitle.includes(song.title);
            return !matches;
          });

          console.log("📊 After removal:", targetPlaylist.songs.length, "songs");
          console.log(`Removed ${initialLength - targetPlaylist.songs.length} song(s)`);

          // Re-render bookshelf (like add function does)
          renderBookshelf();

          return message;
        });
  }

  // Toggle remove button visibility (like modal toggle functions)
  globalThis.toggleRemove = function(moreButton) {
    console.log("🎚️ toggleRemove called");

    if (!moreButton) {
      console.error("❌ No button reference");
      return;
    }

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

    // Hide all other remove buttons first
    document.querySelectorAll('.remove').forEach(btn => {
      if (btn !== removeButton) {
        btn.style.display = 'none';
      }
    });

    // Toggle this specific remove button
    if (removeButton.style.display === 'flex' || removeButton.style.display === 'block') {
      removeButton.style.display = 'none';
    } else {
      removeButton.style.display = 'flex';
    }
  };

  // Main remove song function (structured like add button handler)
  globalThis.removeSong = function(removeButton) {
    console.log("🚀 removeSong initiated");

    if (!removeButton) {
      console.error("❌ No button reference");
      return;
    }

    // Find song data (similar to how add function finds data)
    let songContainer = removeButton.closest('[data-playlist-name]');
    let songName, playlistName;

    if (songContainer) {
      // Standard case with data attributes
      const addedSongsDiv = songContainer.querySelector('.addedSongs');
      const songNameElement = addedSongsDiv?.querySelector('.nameSong');

      if (!songNameElement) {
        console.error("❌ Could not find song name");
        return;
      }

      songName = songNameElement.textContent.trim();
      playlistName = songContainer.dataset.playlistName;
    } else {
      // Fallback case
      const parentDiv = removeButton.parentElement;
      const songDiv = parentDiv?.querySelector(".addedSongs");
      const nameElement = songDiv?.querySelector(".nameSong");

      if (!nameElement) {
        console.error("❌ Could not find song name in fallback");
        return;
      }

      songName = nameElement.textContent.trim();
      songContainer = parentDiv;

      // Try to find playlist name from context
      playlistName = 'Unknown Playlist';
      const playlistNameEl = document.querySelector('.playlist-name');
      if (playlistNameEl) {
        playlistName = playlistNameEl.textContent.trim();
      } else {
        const modalTitle = document.querySelector('.modal-content h3');
        if (modalTitle) {
          playlistName = modalTitle.textContent.trim();
        }
      }
    }

    console.log("📝 Removing song:", songName, "from playlist:", playlistName);

    // Visual feedback
    songContainer.style.opacity = "0.5";
    songContainer.style.transition = "opacity 0.3s";

    // Call our removal function (like add button calls add function)
    removeSongFromPlaylist(playlistName, songName)
        .then(message => {
          // Remove from DOM after successful API call
          songContainer.remove();
          console.log("🗑️ DOM element removed");
          alert(`Canzone rimossa da "${playlistName}"`);
        })
        .catch(err => {
          console.error("❌ Removal failed:", err);
          songContainer.style.opacity = "1"; // Restore on failure
          alert("Errore nella rimozione della canzone");
        });
  };

  // Modal remove function (structured like modal add function)
  globalThis.handleModalRemove = function(removeButton, playlistName, songTitle) {
    console.log("🚀 Modal removal for:", songTitle, "in:", playlistName);

    const songElement = removeButton.closest('.modal-song-card');
    if (!songElement) {
      console.error("❌ Could not find song card");
      return;
    }

    const container = songElement.parentElement;
    const modal = container.closest('.playlist-modal');

    // Visual feedback
    songElement.style.transition = 'opacity 0.3s';
    songElement.style.opacity = '0.5';

    // Call our removal function (like modal add calls add function)
    removeSongFromPlaylist(playlistName, songTitle)
        .then(message => {
          // Remove from modal DOM
          songElement.remove();
          console.log("🗑️ Modal element removed");

          // Close modal if empty
          if (container && container.children.length === 0 && modal) {
            modal.classList.remove('active');
            console.log("🚪 Closed empty modal");
          }
        })
        .catch(err => {
          console.error("❌ Modal removal failed:", err);
          songElement.style.opacity = '1'; // Restore on failure
          alert("Errore nella rimozione della canzone");
        });
  };

  // Event delegation for remove buttons (like add button event delegation)
  document.addEventListener('click', function(event) {
    // Handle more button clicks
    if (event.target.classList.contains('more')) {
      event.stopPropagation();
      globalThis.toggleRemove(event.target);
    }

    // Handle remove button clicks in playlist view
    if (event.target.classList.contains('remove')) {
      event.stopPropagation();
      globalThis.removeSong(event.target);
    }

    // Handle modal remove button clicks
    if (event.target.classList.contains('remove-song')) {
      event.stopPropagation();

      const songCard = event.target.closest('.modal-song-card');
      const songNameElement = songCard?.querySelector('.song-name');
      const modalContent = songCard?.closest('.modal-content');
      const playlistNameElement = modalContent?.querySelector('h3');

      if (!songNameElement || !playlistNameElement) {
        console.error("❌ Could not find required elements for modal removal");
        return;
      }

      const songTitle = songNameElement.textContent.trim();
      const playlistName = playlistNameElement.textContent.trim();

      globalThis.handleModalRemove(event.target, playlistName, songTitle);
    }
  });

  console.log("✅ CreateSongModal.js with removal logic loaded successfully");
});