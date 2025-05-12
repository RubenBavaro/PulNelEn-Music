
document.querySelector('.password-toggle').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const toggleText = this.querySelector('span');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleText.textContent = 'Hide'; 
    } else {
        passwordInput.type = 'password';
        toggleText.textContent = 'Show'; 
    }
});


document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = new URLSearchParams();
    data.append('username', username.value);
    data.append('password', password.value);

    fetch('api/login', { method: 'POST', body: data })
        .then(r => r.json().then(b => ({ status: r.status, body: b })))
        .then(({status, body}) => {
            if (status === 200 && body.success) {
                localStorage.setItem('storageName', 'true');
                window.location.replace("index.html");
                Login = "true";
                localStorage.setItem("storageName", Login);
            } else {
                localStorage.setItem('storageName', 'false');
                window.location.replace("index.html");
                Login = "false";
                localStorage.setItem("storageName", Login);
                alert('Credenziali non valide!');
            }
        })
        .catch(()=> alert('Errore di rete'));

});

document.querySelectorAll('.addedSongs').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-src');
      if (!src) {
        alert('File non trovato per questo brano');
        return;
      }
      window.location.href = `player.html?song=${encodeURIComponent(src)}`;
    });
  });