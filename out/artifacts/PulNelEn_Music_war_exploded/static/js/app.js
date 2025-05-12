// static/js/app.js
import { initIndex }             from './index.js';
import { initPlayer }            from './player.js';
import { initLogin }             from './login.js';
import { initCreatePlaylist }    from './createPlaylist.js';
import { initRemoveSong }        from './removeSong.js';
import { initCreateSongModal }   from './CreateSongModal.js';

// When the DOM is ready, call each initializer
document.addEventListener('DOMContentLoaded', () => {
  initIndex();
  initPlayer();
  initLogin();
  initCreatePlaylist();
  initRemoveSong();
  initCreateSongModal();
});
