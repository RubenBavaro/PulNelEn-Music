document.addEventListener('DOMContentLoaded', function() {
  const createButton       = document.querySelector('.button');
  const playlistNameInput  = document.querySelector('.list input');
  const playlistBookshelf  = document.querySelector('.playlist-bookshelf');

  // Treat array responses as success, too
  function isSuccess(payload) {
    return payload === null
        ? false
        : payload.status === 'success'
        || payload.success === true
        || payload.result === 'OK'
        || Array.isArray(payload);
  }

  createButton.addEventListener('click', async function(e) {
    e.preventDefault();  // stop form reload

    const playlistName = playlistNameInput.value.trim();
    if (!playlistName) {
      return alert('Per favore inserisci un nome per la playlist');
    }

    // Grab your song names (drop the "||" suffix)
    const songs = Array.from(document.querySelectorAll('.nameSong'))
        .map(el => {
          const songName = el.textContent.trim();
          const genreEl = el.nextElementSibling;
          const genre = genreEl ? genreEl.textContent.trim() : 'Pop';
          return { title: songName, genre: genre };
        });

    console.log('→ Sending payload:', { name: playlistName, songs });

    try {
      const response = await fetch('/api/playlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: playlistName, songs })
      });

      console.log('← HTTP status:', response.status, response.statusText);
      console.log('← Response headers:', [...response.headers.entries()]);

      const payload = await response.json();
      console.log('← Full API payload:', payload);

      if (isSuccess(payload)) {
        const newBook = document.createElement('div');
        newBook.className = 'playlist-book';
        newBook.innerHTML = `
          <div class="book-spine">
            <span class="playlist-name">${playlistName}</span>
            <span class="playlist-details">${songs.length} songs</span>
          </div>
          <div class="book-pages">
            ${songs.map(song => `
              <div class="col-2 offset-2" style="position: relative;">
                <div class="addedSongs" style="margin-left: 20px;">
                  <div class="songCover">
                    <img src="static/img/coverSong1.png" alt="Cover">
                  </div>
                  <div class="nameSong">${song.title}</div>
                  <div class="genreSong">${song.genre}</div>
                  <img src="static/img/more.png" class="more" onclick="toggleRemove(this)">
                </div>
                <div class="remove" onclick="removeSong(this)">Rimuovi</div>
              </div>
            `).join('')}
          </div>
        `;

        newBook.addEventListener('click', e => {
          e.stopPropagation();
          const name = newBook.querySelector('.playlist-name').textContent;
          const songsList = Array.from(newBook.querySelectorAll('.nameSong'))
              .map(el => {
                const title = el.textContent;
                const genreEl = el.nextElementSibling;
                return {
                  title: title,
                  artist: title.includes('-') ? title.split('-')[0].trim() : 'Unknown',
                  genre: genreEl ? genreEl.textContent : 'Pop',
                  coverPath: 'static/img/coverSong1.png'
                };
              });
          showPlaylistSongs(name, songsList);
        });

        playlistBookshelf.appendChild(newBook);

        // Clear input and any added-song entries
        playlistNameInput.value = '';
        document.querySelectorAll('.nameSong')
            .forEach(el => el.closest('.addSong')?.remove());

        alert(`Playlist "${playlistName}" creata con successo!`);

      } else {
        console.warn('API returned failure payload:', payload);
        // For arrays, there's no message; fall back to a generic success
        const msg = (payload && payload.message)
            ? payload.message
            : 'Errore durante la creazione della playlist';
        alert(msg);
      }

    } catch (err) {
      console.error('Fetch / parse error:', err);
      alert('Si è verificato un errore. Riprova più tardi.');
    }
  });
});