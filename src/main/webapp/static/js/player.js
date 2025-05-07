
document.addEventListener("DOMContentLoaded", function () {
    fetch("player-servlet")
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const title = doc.querySelector(".titleSong")?.textContent || "No Title";
            const artist = doc.querySelector(".artistSong")?.textContent || "Unknown Artist";
            const genre = doc.querySelector(".genreSong")?.textContent || "Genre";
            const coverSrc = doc.querySelector(".songCover img")?.getAttribute("src") || "";

            document.querySelector(".titleSong").textContent = title;
            document.querySelector(".artistSong").textContent = artist;
            document.querySelector(".genreSong").textContent = genre;
            if (coverSrc) document.querySelector(".songCover img").src = coverSrc;
        })
        .catch(err => {
            console.error("Errore caricando la canzone:", err);
        });
});


document.addEventListener("DOMContentLoaded", () => {
    const audio        = document.getElementById("audioPlayer");
    const backBtn      = document.getElementById("backBtn");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const nextBtn      = document.getElementById("nextBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeIcon   = document.getElementById("volumeIcon");

    const titleEl  = document.querySelector(".name");
    const artistEl = document.querySelector(".author");
    const genreEl  = document.querySelector(".genre");
    const coverImg = document.querySelector(".cover");

    let playlist = [];
    let currentIndex = 0;

    const plName = new URLSearchParams(window.location.search).get("name");
    fetch(`/api/playlist?name=${encodeURIComponent(plName)}`)
        .then(r => r.json())
        .then(data => {
            playlist = data;
            loadSong(0);
        })
        .catch(err => console.error("Errore caricando playlist:", err));

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

    backBtn.addEventListener("click", () => loadSong(currentIndex - 1));
    nextBtn.addEventListener("click", () => loadSong(currentIndex + 1));
    volumeIcon.addEventListener("click", () => {
        if("click"===1)
        volumeIcon.src = "static/img/muted-volume.png";
    });

    volumeSlider.addEventListener("input", () => {
        audio.volume = parseFloat(volumeSlider.value);
        if (audio.volume === 0) {
            volumeIcon.src = "static/img/0-volume.png";
        } else if (audio.volume < 0.5) {
            volumeIcon.src = "static/img/med-volume.png";
        } else {
            volumeIcon.src = "static/img/max-volume.png";
        }
    });

    audio.addEventListener("ended", () => {
        playPauseBtn.src = "static/img/play.png";
        playPauseBtn.alt = "Play";
    });
});
