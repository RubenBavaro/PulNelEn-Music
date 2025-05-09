let flag= 0;

const audio = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const backBtn      = document.getElementById("backBtn");
const nextBtn      = document.getElementById("nextBtn");
const volumeSlider = document.getElementById("volumeSlider");
const volumeIcon   = document.getElementById("volumeIcon");
document.addEventListener("DOMContentLoaded", () => {

  
    const titleEl  = document.querySelector(".name");
    const artistEl = document.querySelector(".author");
    const genreEl  = document.querySelector(".genre");
    const coverImg = document.querySelector(".cover");
  
    const params = new URLSearchParams(location.search);
    const songSrc = params.get("song");
    if (!songSrc) {
      console.log("Nessun brano selezionato");
      return;
    }
  
    audio.src = songSrc;
    const filename = songSrc.split("/").pop().replace(".mp4", "");
    titleEl.textContent  = filename;
    artistEl.textContent = ""; 
    genreEl.textContent  = "";

    function loadSong(i) {
        if (i < 0) i = playlist.length - 1;
        if (i >= playlist.length) i = 0;
        currentIndex = i;

        const song = playlist[currentIndex];
        audio.src      = song.src;
        titleEl.textContent  = song.title;
        artistEl.textContent = song.artist;
        genreEl.textContent  = song.genre;
        if (song.cover) coverImg.src = song.cover;

        if (!audio.paused) audio.play();
    }
});
playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.src = "static/img/pause.png";
        playPauseBtn.alt = "Pause";
    } else {
        audio.pause();
        playPauseBtn.src = "static/img/play.png";
        playPauseBtn.alt = "Play";
    }
});


    volumeSlider.addEventListener("input", () => {
        const raw = volumeSlider.value;
        const vol = parseFloat(raw);
      
        if (!isFinite(vol) || vol < 0 || vol > 1) {
          console.warn("Volume slider value non valido:", raw);
          return;
        }
      
        audio.volume = vol;
      
        if (vol === 0) {
          volumeIcon.src = "static/img/0-volume.png";
        } else if (vol < 0.5) {
          volumeIcon.src = "static/img/med-volume.png";
        } else {
          volumeIcon.src = "static/img/max-volume.png";
        }
      });

      backBtn.addEventListener("click", () => loadSong(currentIndex - 1));
      nextBtn.addEventListener("click", () => loadSong(currentIndex + 1));
      volumeIcon.addEventListener("click", () => {
          flag= flag+1
          if(flag===1){
              volumeIcon.src = "static/img/muted-volume.png";
              console.log("muted")
          }else{
              console.log("not muted")      
              const raw = volumeSlider.value;
              const vol = parseFloat(raw);
              if (!isFinite(vol) || vol < 0 || vol > 1) {
                console.warn("Volume slider value non valido:", raw);
                return;
              }
              audio.volume = vol;
              if (vol === 0) {
                volumeIcon.src = "static/img/0-volume.png";
              } else if (vol < 0.5) {
                volumeIcon.src = "static/img/med-volume.png";
              } else {
                volumeIcon.src = "static/img/max-volume.png";
              }
              flag = 0
          }
      });
      

audio.addEventListener("ended", () => {
    playPauseBtn.src = "static/img/play.png";
    playPauseBtn.alt = "Play";
});