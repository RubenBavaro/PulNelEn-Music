
document.querySelectorAll("#addSong .aggiungi").forEach(button => {
    button.addEventListener("click", function () {
        const songName = this.parentElement.querySelector(".songName").textContent.trim();
        const artist = this.parentElement.querySelector(".songArtist").textContent.trim();
        const playlistName = document.querySelector(".list input").value;
        const genre = prompt("Inserisci il genere della canzone:");

        fetch("addSong", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                name: playlistName,
                song: songName,
                artist: artist,
                genre: genre
            })
        })
        .then(res => res.text())
        .then(alert)
        .catch(err => {
            console.error("Errore nell'aggiunta:", err);
            alert("Errore durante l'aggiunta.");
        });
    });
});
