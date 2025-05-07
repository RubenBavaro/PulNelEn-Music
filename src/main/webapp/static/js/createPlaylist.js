
document.querySelector(".button").addEventListener("click", function () {
    const playlistName = document.querySelector(".list input").value;
    if (!playlistName) {
        alert("Inserisci un nome per la playlist");
        return;
    }

    fetch("createPlaylist", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: playlistName })
    })
    .then(res => res.text())
    .then(res => {
        alert(res);
    })
    .catch(err => {
        console.error("Errore nella creazione della playlist:", err);
        alert("Errore durante la creazione.");
    });
});
