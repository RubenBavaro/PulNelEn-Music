document.querySelectorAll(".aggiungi").forEach(button => {
    button.addEventListener("click", function() {
        const songName = this.dataset.title;
        const artist = this.dataset.artist;
        const genre = this.dataset.genre;
        const playlistName = document.querySelector(".list input").value;

        fetch("/api/playlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                name: playlistName,
                song: songName,
                artist: artist,
                genre: genre
            })
        })
            .then(res => res.json())
            .then(data => {
                if(data.status === "success") {
                    // Add song to UI
                    const newSong = document.createElement('div');
                    newSong.className = 'addedSongs';
                    newSong.innerHTML = `
                    <div class="songCover"><img src="static/img/coverSong1.png"></div>
                    <div class="nameSong">${songName}</div>
                    <div class="genreSong">${genre}</div>
                    <img src="static/img/more.png" class="more" onclick="toggleRemove(this)">
                `;
                    document.querySelector('.row').appendChild(newSong);
                }
            });
    });
});