document.addEventListener('DOMContentLoaded', function() {
    const createButton = document.querySelector('.button');
    const playlistNameInput = document.querySelector('.list input');

    createButton.addEventListener('click', function() {
        const playlistName = playlistNameInput.value;
        const songs = Array.from(document.querySelectorAll('.nameSong'))
            .map(el => el.textContent + "||"); // Add pipe separators

        const params = new URLSearchParams();
        params.append('name', playlistName);
        songs.forEach(song => params.append('songs', song));

        fetch('/api/playlist', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => console.error('Error:', error));
    });
});