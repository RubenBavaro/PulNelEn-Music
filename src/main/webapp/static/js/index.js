function toggleRemove(moreButton) {
    var removeButton = moreButton.closest('.addedSongs').nextElementSibling;
    
    if (removeButton.style.display === 'none' || removeButton.style.display === '') {
        removeButton.style.display = 'flex';
    } else {
        removeButton.style.display = 'none';
    }
}

function removeSong(removeButton) {
    var songElement = removeButton.previousElementSibling;
    songElement.remove();
    removeButton.remove();
}
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('click', function() {
            if (this.value === this.getAttribute('placeholder')) {
                this.value = '';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = this.getAttribute('placeholder');
            }
        });
    });
});

    const navbarToggle = document.getElementById('navbarToggle');
    const navbarDropdown = document.getElementById('navbarDropdown');
    
    navbarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navbarDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', function(e) {
        if (!navbarDropdown.contains(e.target) && !navbarToggle.contains(e.target)) {
            navbarDropdown.classList.remove('show');
        }
    });

let loginStatus = localStorage.getItem("storageName");




window.addEventListener("DOMContentLoaded", () => {

    const logInDiv = document.getElementById("logIn");
    const logInLink = document.querySelector("a[href='login.html']");

    if (loginStatus === "true") {
            fetch("getUser")
                .then(r => r.text())
                .then(username => {
                    if (username==="Log In"){
                        loginStatus = false;
                    } else {
                        if (logInLink) {
                            console.log("logged in")
                            logInLink.removeAttribute("href");
                            logInLink.style.cursor = "default";
                        }
                        logInDiv.innerHTML = `
                        <span class="username">${username}</span>
                        <img src="static/img/account_circle.png" alt="Account">`;
                    }
                })
                .catch(err => console.error("Failed to fetch user:", err));
    } else {
        console.log("User is not logged in");
    }
});
