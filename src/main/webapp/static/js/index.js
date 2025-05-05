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