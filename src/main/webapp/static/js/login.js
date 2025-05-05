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