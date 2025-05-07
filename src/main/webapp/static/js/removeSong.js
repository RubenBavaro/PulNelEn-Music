
document.querySelectorAll(".remove").forEach(button => {
    button.addEventListener("click", function () {
        const songDiv = this.previousElementSibling;
        const songName = songDiv.querySelector(".nameSong").textContent.trim();
        const playlistName = document.querySelector(".list input").value;

        fetch("removeSong", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                name: playlistName,
                song: songName
            })
        })
        .then(res => res.text())
        .then(alert)
        .catch(err => {
            console.error("Errore nella rimozione:", err);
            alert("Errore durante la rimozione.");
        });
    });
});
