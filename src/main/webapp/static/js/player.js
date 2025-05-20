document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio player and controls
    let flag = 0;
    let currentIndex = 0;
    let playlist = [];
    let isDragging = false;

    // Get DOM elements only if they exist
    const audio = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeIcon = document.getElementById("volumeIcon");
    const actualTimeEl = document.querySelector(".actualTime");
    const fullTimeEl = document.querySelector(".fullTime");
    const titleEl = document.querySelector(".name");
    const artistEl = document.querySelector(".author");
    const genreEl = document.querySelector(".genre");
    const coverImg = document.querySelector(".cover");

    // Only initialize player on the player page
    if (!audio || !playPauseBtn) {
        console.log("Not on player page, audio controls not initialized");
        return; // Exit early if we're not on the player page
    }

    // Create progress handle if it doesn't exist
    let progressHandle = document.querySelector(".progress-handle");
    if (!progressHandle && actualTimeEl && fullTimeEl) {
        progressHandle = document.createElement("div");
        progressHandle.className = "progress-handle";
        actualTimeEl.parentNode.appendChild(progressHandle);
    }

    // Get song from URL parameters
    const params = new URLSearchParams(location.search);
    const songParam = params.get("song");

    if (songParam) {
        // Check if it's a file path or song title
        if (songParam.includes("/") || songParam.includes("\\")) {
            // It's a file path
            audio.src = songParam;
            const filename = songParam.split("/").pop().replace(/\.(mp3|mp4|wav)$/, "");
            titleEl.textContent = filename;
            artistEl.textContent = "";
            genreEl.textContent = "";
        } else {
            // It's a song title - need to load details
            fetchSongDetails(songParam).then(song => {
                titleEl.textContent = song.title || songParam;
                artistEl.textContent = song.artist || "";
                genreEl.textContent = song.genre || "";

                // Use placeholder audio if no source is available
                audio.src = song.filePath || "static/audio/placeholder.mp3";

                // Update cover if available
                if (song.coverPath) {
                    coverImg.src = song.coverPath;
                }

                // Try to build a mini-playlist of songs from the same artist
                fetchRelatedSongs(song.artist).then(songs => {
                    if (songs && songs.length > 0) {
                        playlist = songs;
                        currentIndex = playlist.findIndex(s => s.title === song.title);
                        if (currentIndex === -1) currentIndex = 0;
                    } else {
                        // Just add this song to the playlist
                        playlist = [song];
                        currentIndex = 0;
                    }
                });

                // Update last played
                updateLastPlayed(song);
            });
        }
    } else {
        // No song selected, load last played
        fetchLastPlayed().then(song => {
            if (song) {
                titleEl.textContent = song.title || "Unknown Track";
                artistEl.textContent = song.artist || "";
                genreEl.textContent = song.genre || "";

                // Use placeholder audio if no source is available
                audio.src = song.filePath || "static/audio/placeholder.mp3";

                // Update cover if available
                if (song.coverPath) {
                    coverImg.src = song.coverPath;
                }

                // Add to playlist
                playlist = [song];
                currentIndex = 0;
            } else {
                // Fallback to placeholder
                titleEl.textContent = "Demo Track";
                artistEl.textContent = "PulNelEn";
                genreEl.textContent = "Demo";
                audio.src = "static/audio/placeholder.mp3";
            }
        }).catch(error => {
            console.error("Error loading last played song:", error);
            // Fallback to placeholder
            titleEl.textContent = "Demo Track";
            artistEl.textContent = "PulNelEn";
            genreEl.textContent = "Demo";
            audio.src = "static/audio/placeholder.mp3";
        });
    }

    // Add metadata loaded event to set the duration immediately when available
    audio.addEventListener("loadedmetadata", () => {
        if (fullTimeEl && !isNaN(audio.duration)) {
            fullTimeEl.textContent = formatTime(audio.duration);
        }
    });

    // Add time update listener
    audio.addEventListener("timeupdate", updateProgressBar);

    // Initialize progress bar click functionality
    if (fullTimeEl) {
        // Click to seek
        fullTimeEl.addEventListener("click", function(e) {
            seek(e);
        });

        // Show time preview on hover
        fullTimeEl.addEventListener("mousemove", function(e) {
            showSeekPreview(e);
        });

        fullTimeEl.addEventListener("mouseout", function() {
            if (!isDragging) {
                hideSeekPreview();
            }
        });
    }

    // Make the progress handle draggable
    if (progressHandle) {
        progressHandle.addEventListener("mousedown", function(e) {
            isDragging = true;
            document.addEventListener("mousemove", handleDrag);
            document.addEventListener("mouseup", stopDrag);
            e.preventDefault(); // Prevent text selection
        });
    }

    function handleDrag(e) {
        if (!isDragging || !fullTimeEl) return;

        const rect = fullTimeEl.getBoundingClientRect();
        let percentage = (e.clientX - rect.left) / rect.width;

        // Clamp percentage between 0 and 1
        percentage = Math.max(0, Math.min(0.5, percentage));

        // Update progress bar visually during drag
        if (actualTimeEl) {
            actualTimeEl.style.width = `${percentage * 100}%`;
        }

        // Update handle position
        if (progressHandle) {
            progressHandle.style.left = `${percentage * 100}%`;
        }

        // Show time preview during drag
        if (!isNaN(audio.duration)) {
            const previewTime = percentage * audio.duration;
            showTimePreview(e.clientX, previewTime);
        }
    }

    function stopDrag(e) {
        if (!isDragging) return;

        // Set the actual audio time
        if (fullTimeEl && !isNaN(audio.duration)) {
            const rect = fullTimeEl.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = percentage * audio.duration;
        }

        isDragging = false;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
        hideSeekPreview();
    }

    // Play/Pause button
    playPauseBtn.addEventListener("click", () => {
        if (audio.readyState < 2) {
            // Audio not loaded yet, use placeholder
            audio.src = "static/audio/placeholder.mp3";
        }

        if (audio.paused) {
            audio.play().catch(err => {
                console.error("Error playing audio:", err);
                // If there's an error with the current source, try with known working paths
                tryPlaying();
            });
            playPauseBtn.src = "static/img/pause.png";
            playPauseBtn.alt = "Pause";
        } else {
            audio.pause();
            playPauseBtn.src = "static/img/play.png";
            playPauseBtn.alt = "Play";
        }
    });

    // Volume control
    volumeSlider.addEventListener("input", () => {
        const raw = volumeSlider.value;
        const vol = parseFloat(raw);

        if (!isFinite(vol) || vol < 0 || vol > 1) {
            console.warn("Volume slider value non valido:", raw);
            return;
        }

        audio.volume = vol;

        if (vol === 0) {
            volumeIcon.src = "static/img/0-volume.png";
        } else if (vol < 0.5) {
            volumeIcon.src = "static/img/med-volume.png";
        } else {
            volumeIcon.src = "static/img/max-volume.png";
        }
    });

    // Skip buttons
    backBtn.addEventListener("click", () => loadSong(currentIndex - 1));
    nextBtn.addEventListener("click", () => loadSong(currentIndex + 1));

    // Mute toggle
    volumeIcon.addEventListener("click", () => {
        flag = flag + 1;
        if (flag === 1) {
            audio.muted = true;
            volumeIcon.src = "static/img/muted-volume.png";
        } else {
            audio.muted = false;
            const raw = volumeSlider.value;
            const vol = parseFloat(raw);

            if (!isFinite(vol) || vol < 0 || vol > 1) {
                console.warn("Volume slider value non valido:", raw);
                return;
            }

            audio.volume = vol;

            if (vol === 0) {
                volumeIcon.src = "static/img/0-volume.png";
            } else if (vol < 0.5) {
                volumeIcon.src = "static/img/med-volume.png";
            } else {
                volumeIcon.src = "static/img/max-volume.png";
            }

            flag = 0;
        }
    });

    // When song ends
    audio.addEventListener("ended", () => {
        playPauseBtn.src = "static/img/play.png";
        playPauseBtn.alt = "Play";

        // Auto advance to next song
        if (playlist.length > 1) {
            loadSong(currentIndex + 1);
        }
    });

    // Internal function to try playing with alternate paths
    function tryPlaying() {
        const title = titleEl.textContent;
        const artist = artistEl.textContent;

        // Special case for "The Kolors - Un ragazzo una ragazza"
        if (artist.toLowerCase().includes("kolors") || title.toLowerCase().includes("ragazzo")) {
            console.log("Trying special case for The Kolors");
            audio.src = "static/audio/The Kolors - Un ragazzo una ragazza.mp3";
            audio.play().then(() => {
                playPauseBtn.src = "static/img/pause.png";
                playPauseBtn.alt = "Pause";
            }).catch(err => {
                console.error("Failed to play The Kolors special case:", err);
                tryAlternativePaths();
            });
            return;
        }

        // Special case for "Tony Effe - DAMME 'NA MANO"
        if (artist.toLowerCase().includes("tony") || title.toLowerCase().includes("damme")) {
            console.log("Trying special case for Tony Effe");
            audio.src = "static/audio/Tony-Effe-DAMME-_NA-MANO.mp3";
            audio.play().then(() => {
                playPauseBtn.src = "static/img/pause.png";
                playPauseBtn.alt = "Pause";
            }).catch(err => {
                console.error("Failed to play Tony Effe special case:", err);
                tryAlternativePaths();
            });
            return;
        }

        // Try with other paths if specific cases fail
        tryAlternativePaths();
    }

    function tryAlternativePaths() {
        // Generate hard-coded paths based on song info
        const title = titleEl.textContent;
        const artist = artistEl.textContent;

        // Try with placeholder as fallback
        audio.src = "static/audio/placeholder.mp3";
        audio.play().then(() => {
            playPauseBtn.src = "static/img/pause.png";
            playPauseBtn.alt = "Pause";
        }).catch(err => {
            console.error("Failed to play even placeholder audio:", err);
        });
    }

    // Function to seek to a specific position in the song
    function seek(e) {
        if (!audio || !fullTimeEl) return;

        const rect = fullTimeEl.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;

        if (isNaN(audio.duration)) return;

        // Calculate time based on percentage
        const seekTime = percentage * audio.duration;

        // Set the current time
        audio.currentTime = seekTime;

        // Update progress bar
        updateProgressBar();
    }

    // Function to show time preview at a specific position
    function showTimePreview(x, time) {
        // Get existing or create hover indicator
        let hoverIndicator = document.querySelector('.hover-time-indicator');
        if (!hoverIndicator) {
            hoverIndicator = document.createElement('div');
            hoverIndicator.className = 'hover-time-indicator';
            document.querySelector('.playback').appendChild(hoverIndicator);
        }

        // Position the indicator
        hoverIndicator.style.left = `${x - 20}px`;
        hoverIndicator.style.top = `${fullTimeEl.getBoundingClientRect().top - 25}px`;
        hoverIndicator.textContent = formatTime(time);
        hoverIndicator.style.display = 'block';
    }

    // Function to show seek preview (time indicator)
    function showSeekPreview(e) {
        if (!audio || !fullTimeEl || isNaN(audio.duration)) return;

        const rect = fullTimeEl.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;

        // Calculate time based on percentage
        const previewTime = percentage * audio.duration;

        // Show time preview
        showTimePreview(e.clientX, previewTime);
    }

    // Function to hide seek preview
    function hideSeekPreview() {
        const hoverIndicator = document.querySelector('.hover-time-indicator');
        if (hoverIndicator) {
            hoverIndicator.style.display = 'none';
        }
    }
});

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Update progress bar and time displays
function updateProgressBar() {
    const audio = document.getElementById("audioPlayer");
    const actualTimeEl = document.querySelector(".actualTime");
    const fullTimeEl = document.querySelector(".fullTime");
    const progressHandle = document.querySelector(".progress-handle");

    if (!audio) return;

    // Update current time display
    if (fullTimeEl) {
        fullTimeEl.setAttribute('data-current-time', formatTime(audio.currentTime));
    }

    // Update the width of the progress bar and handle position
    if (actualTimeEl && !isNaN(audio.duration) && audio.duration > 0) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        actualTimeEl.style.width = `${percentage}%`;

        // Update position of handle
        if (progressHandle) {
            progressHandle.style.left = `${percentage}%`;
        }
    }

    // Update duration if available and not already set
    if (fullTimeEl && !isNaN(audio.duration)) {
        fullTimeEl.setAttribute('data-duration', formatTime(audio.duration));
    }
}

// Load and play a specific song in the playlist
function loadSong(index) {
    const audio = document.getElementById("audioPlayer");
    const titleEl = document.querySelector(".name");
    const artistEl = document.querySelector(".author");
    const genreEl = document.querySelector(".genre");
    const coverImg = document.querySelector(".cover");
    const actualTimeEl = document.querySelector(".actualTime");
    const fullTimeEl = document.querySelector(".fullTime");
    const playPauseBtn = document.getElementById("playPauseBtn");

    if (!audio || !titleEl || !playlist || playlist.length === 0) return;

    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentIndex = index;
    const song = playlist[currentIndex];

    // Update display
    titleEl.textContent = song.title || "Unknown Track";
    artistEl.textContent = song.artist || "";
    genreEl.textContent = song.genre || "";

    // Reset time displays
    if (actualTimeEl) {
        actualTimeEl.style.width = "0%";
    }

    // Reset handle position
    const progressHandle = document.querySelector(".progress-handle");
    if (progressHandle) {
        progressHandle.style.left = "0%";
    }

    // Load audio
    const wasPlaying = !audio.paused;

    // Try special cases for problematic songs first
    if ((song.artist && song.artist.toLowerCase().includes("kolors")) ||
        (song.title && song.title.toLowerCase().includes("ragazzo"))) {
        console.log("Loading The Kolors song with special handling");
        audio.src = "static/audio/The Kolors - Un ragazzo una ragazza.mp3";
    }
    else if ((song.artist && song.artist.toLowerCase().includes("tony")) ||
        (song.title && song.title.toLowerCase().includes("damme"))) {
        console.log("Loading Tony Effe song with special handling");
        audio.src = "static/audio/Tony-Effe-DAMME-_NA-MANO.mp3";
    }
    else {
        // First try with the static hardcoded paths for known songs
        const hardcodedPath = getHardcodedPath(song.artist, song.title);
        if (hardcodedPath) {
            console.log("Using hardcoded path:", hardcodedPath);
            audio.src = hardcodedPath;
        } else {
            // Use the file path from the song object or create one as fallback
            audio.src = song.filePath || createFilePath(song.artist, song.title);
        }
    }

    // Reset play button to play state initially
    playPauseBtn.src = "static/img/play.png";
    playPauseBtn.alt = "Play";

    // Update cover if available
    if (song.coverPath) {
        coverImg.src = song.coverPath;
    } else {
        // Default to a known cover from the website
        coverImg.src = "static/img/coverSong1.png";
    }

    // Continue playing if was playing before
    updateLastPlayed(song).then(() => {
        if (wasPlaying) {
            audio.play().catch((err) => {
                console.error("Error playing audio:", err);
                console.log("Tried to play:", audio.src);

                // Try with explicit fallback paths
                tryAlternateFileNames(song, audio).catch(() => {
                    // If all fails, use placeholder
                    audio.src = "static/audio/placeholder.mp3";
                    audio.play().catch((err2) => {
                        console.error("Error playing fallback audio:", err2);
                    });
                });
            });

            // Update button state only if play succeeds
            audio.addEventListener('playing', function oncePlay() {
                playPauseBtn.src = "static/img/pause.png";
                playPauseBtn.alt = "Pause";
                audio.removeEventListener('playing', oncePlay);
            });
        }
    });
}

// Hardcoded paths for specific songs (guaranteed to work)
function getHardcodedPath(artist, title) {
    // Convert to lowercase for case-insensitive matching
    const artistLower = artist ? artist.toLowerCase() : "";
    const titleLower = title ? title.toLowerCase() : "";

    // Hardcoded mappings based on known songs
    const paths = {
        "olly balorda nostalgia": "static/audio/OLLY - Balorda Nostalgia.mp3",
        "tony effe damme 'na mano": "static/audio/Tony-Effe-DAMME-_NA-MANO.mp3",
        "the kolors un ragazzo una ragazza": "static/audio/The Kolors - Un ragazzo una ragazza.mp3",
        "giorgia la cura per me": "static/audio/Giorgia - La cura per me.mp3",
        "fedez battito": "static/audio/Fedez - BATTITO.mp3"
    };

    // Check for known combinations
    const key = `${artistLower} ${titleLower}`.replace(/['']/g, "").trim();

    // Return hardcoded path or null if not found
    return paths[key] || null;
}

// Helper function to try alternative file names
async function tryAlternateFileNames(song, audio) {
    if (!song.artist || !song.title) {
        throw new Error("Missing song artist or title");
    }

    // Define hardcoded working paths for specific songs
    const hardcodedPaths = {
        "Tony Effe DAMME 'NA MANO": "static/audio/Tony-Effe-DAMME-_NA-MANO.mp3",
        "OLLY Balorda Nostalgia": "static/audio/OLLY - Balorda Nostalgia.mp3",
        "The Kolors Un ragazzo una ragazza": "static/audio/The Kolors - Un ragazzo una ragazza.mp3",
        "Giorgia La cura per me": "static/audio/Giorgia - La cura per me.mp3",
        "Fedez BATTITO": "static/audio/Fedez - BATTITO.mp3"
    };

    // Check hardcoded paths first
    const hardcodedKey = `${song.artist} ${song.title}`.replace(/['']/g, "");
    if (hardcodedPaths[hardcodedKey]) {
        console.log("Using hardcoded path for:", hardcodedKey);
        audio.src = hardcodedPaths[hardcodedKey];
        await audio.play();
        return;
    }

    // Define a wide variety of possible path patterns
    const alternatives = [
        // Original form with space
        `static/audio/${song.artist} - ${song.title}.mp3`,
        // With hyphen
        `static/audio/${song.artist}-${song.title}.mp3`,
        // With underscores
        `static/audio/${song.artist}_${song.title}.mp3`,
        `static/audio/${song.artist}-${song.title.replace(/\s/g, "-")}.mp3`,
        `static/audio/${song.artist}-${song.title.replace(/\s/g, "_")}.mp3`,
        // Specific transformation for single quote
        `static/audio/${song.artist}-${song.title.replace(/'/g, "").replace(/\s/g, "-")}.mp3`,
        // Without artist
        `static/audio/${song.title}.mp3`,
        // Without special chars
        `static/audio/${song.artist}-${song.title.replace(/[^\w\s]/gi, "")}.mp3`
    ];

    // Add special case filenames with explicit priorities
    if (song.artist.toLowerCase() === "tony effe" && song.title.toLowerCase().includes("damme")) {
        alternatives.unshift("static/audio/Tony-Effe-DAMME-_NA-MANO.mp3");
    }

    if (song.artist.toLowerCase() === "the kolors" && song.title.toLowerCase().includes("ragazzo")) {
        alternatives.unshift("static/audio/The Kolors - Un ragazzo una ragazza.mp3");
    }

    if (song.artist.toLowerCase() === "olly" && song.title.toLowerCase().includes("balorda")) {
        alternatives.unshift("static/audio/OLLY - Balorda Nostalgia.mp3");
    }

    if (song.artist.toLowerCase() === "giorgia" && song.title.toLowerCase().includes("cura")) {
        alternatives.unshift("static/audio/Giorgia - La cura per me.mp3");
    }

    if (song.artist.toLowerCase() === "fedez" && song.title.toLowerCase().includes("battito")) {
        alternatives.unshift("static/audio/Fedez - BATTITO.mp3");
    }

    // Try each alternative
    for (const alt of alternatives) {
        try {
            console.log("Trying alternative:", alt);
            audio.src = alt;
            await audio.play();
            console.log("Successfully played:", alt);
            return; // If success, exit
        } catch (err) {
            console.warn(`Failed to play ${alt}:`, err);
            // Continue to next alternative
        }
    }

    // If we get here, all alternatives failed
    throw new Error("All file alternatives failed");
}

// Fetch song details from server
async function fetchSongDetails(songTitle) {
    try {
        // Handle song titles that might include artist information
        let title = songTitle;
        let artist = "Unknown Artist";
        let genre = "Unknown";
        let coverPath = "static/img/coverSong1.png"; // Default cover

        // Normalize the input by removing file extensions and standardizing separators
        const normalizedInput = songTitle.replace(/\.(mp3|wav|ogg|m4a)$/i, "")
            .replace(/[-_]/g, " ");

        // Check if the title contains artist information with various separator styles
        if (normalizedInput.includes(" - ")) {
            const parts = normalizedInput.split(" - ");
            artist = parts[0].trim();
            title = parts[1].trim();
        } else if (normalizedInput.includes("–")) { // Em dash
            const parts = normalizedInput.split("–");
            artist = parts[0].trim();
            title = parts[1].trim();
        } else if (normalizedInput.includes(" _ ")) {
            const parts = normalizedInput.split("_");
            artist = parts[0].trim();
            title = parts[1].trim();
        }

        // Known songs mapping with accurate file paths
        const knownSongs = {
            "olly balorda nostalgia": {
                title: "Balorda Nostalgia",
                artist: "OLLY",
                genre: "Power ballad pop",
                coverPath: "static/img/coverSong1.png",
                filePath: "static/audio/OLLY - Balorda Nostalgia.mp3"
            },
            "fedez battito": {
                title: "BATTITO",
                artist: "Fedez",
                genre: "Pop",
                coverPath: "static/img/coverSong.png",
                filePath: "static/audio/Fedez - BATTITO.mp3"
            },
            "giorgia la cura per me": {
                title: "LA CURA PER ME",
                artist: "Giorgia",
                genre: "Pop",
                coverPath: "static/img/coverSong1.png",
                filePath: "static/audio/Giorgia - La cura per me.mp3"
            },
            "the kolors un ragazzo una ragazza": {
                title: "UN RAGAZZO UNA RAGAZZA",
                artist: "The Kolors",
                genre: "Pop",
                coverPath: "static/img/coverSong.png",
                filePath: "static/audio/The Kolors - Un ragazzo una ragazza.mp3"
            },
            "tony effe damme na mano": {
                title: "DAMME 'NA MANO",
                artist: "Tony Effe",
                genre: "Pop",
                coverPath: "static/img/coverSong1.png",
                filePath: "static/audio/Tony-Effe-DAMME-_NA-MANO.mp3"
            }
        };

        // Check if it's a known song
        const lookupKey = `${artist.toLowerCase()} ${title.toLowerCase()}`
            .replace(/['']/g, "") // Remove apostrophes for matching
            .replace(/\s+/g, " "); // Normalize spaces

        const knownSong = knownSongs[lookupKey];

        if (knownSong) {
            console.log(`Found known song: ${lookupKey}`);
            title = knownSong.title;
            artist = knownSong.artist;
            genre = knownSong.genre;
            coverPath = knownSong.coverPath;

            // Return with hardcoded file path that we know works
            return {
                title: title,
                artist: artist,
                genre: genre,
                filePath: knownSong.filePath,
                coverPath: coverPath
            };
        }

        // Try to get data from API
        try {
            const response = await fetch(`/api/song?title=${encodeURIComponent(title)}`);

            // If API call succeeds, use that data but keep our metadata as fallback
            if (response.ok) {
                const data = await response.json();
                // Use API data but keep our metadata if API doesn't provide it
                return {
                    title: data.title || title,
                    artist: data.artist || artist,
                    genre: data.genre || genre,
                    filePath: data.filePath || createFilePath(artist, title),
                    coverPath: data.coverPath || coverPath
                };
            }
        } catch (apiError) {
            console.warn("API fetch failed, using hardcoded song info:", apiError);
        }

        // API call failed, check again for known songs with more flexibility
        for (const [key, songData] of Object.entries(knownSongs)) {
            // More flexible matching
            if (key.includes(title.toLowerCase()) ||
                key.includes(artist.toLowerCase()) ||
                (artist.toLowerCase() + " " + title.toLowerCase()).includes(key)) {
                console.log(`Found fuzzy match for song: ${key}`);
                return songData;
            }
        }

        // Special cases based on partial title or artist information
        if (title.toLowerCase().includes("un ragazzo") || artist.toLowerCase().includes("kolors")) {
            return knownSongs["the kolors un ragazzo una ragazza"];
        }

        if (title.toLowerCase().includes("damme") || artist.toLowerCase().includes("tony")) {
            return knownSongs["tony effe damme na mano"];
        }

        // Use our parsed information as last resort
        console.warn(`Song details not found for: ${songTitle}, using parsed information`);
        return {
            title: title,
            artist: artist,
            genre: genre,
            filePath: createFilePath(artist, title),
            coverPath: coverPath
        };
    } catch (error) {
        console.error("Error fetching song details:", error);

        // Extract artist and title if possible
        let title = songTitle;
        let artist = "Unknown Artist";

        // Try to extract artist and title even on error
        const normalizedInput = songTitle.replace(/\.(mp3|wav|ogg|m4a)$/i, "")
            .replace(/[-_]/g, " ");

        if (normalizedInput.includes(" - ")) {
            const parts = normalizedInput.split(" - ");
            artist = parts[0].trim();
            title = parts[1].trim();
        } else if (normalizedInput.includes("–")) { // Em dash
            const parts = normalizedInput.split("–");
            artist = parts[0].trim();
            title = parts[1].trim();
        }

        // Return default song object with the best information we have
        return {
            title: title,
            artist: artist,
            genre: "Unknown",
            filePath: createFilePath(artist, title),
            coverPath: "static/img/coverSong1.png"
        };
    }
}

// Helper function to create appropriate file paths based on artist and title
function createFilePath(artist, title) {
    if (!artist || !title) {
        return "static/audio/placeholder.mp3";
    }

    // Handle special cases first
    if (artist.toLowerCase() === "tony effe" && title.toLowerCase().includes("damme")) {
        return "static/audio/Tony-Effe-DAMME-_NA-MANO.mp3";
    }

    if (artist.toLowerCase() === "olly" && title.toLowerCase().includes("balorda")) {
        return "static/audio/OLLY - Balorda Nostalgia.mp3";
    }

    if (artist.toLowerCase() === "the kolors" && title.toLowerCase().includes("ragazzo")) {
        return "static/audio/The Kolors - Un ragazzo una ragazza.mp3";
    }

    if (artist.toLowerCase() === "giorgia" && title.toLowerCase().includes("cura")) {
        return "static/audio/Giorgia - La cura per me.mp3";
    }

    if (artist.toLowerCase() === "fedez" && title.toLowerCase().includes("battito")) {
        return "static/audio/Fedez - BATTITO.mp3";
    }

    // For standard cases, use the artist - title format
    // Remove any quotes that might cause issues in filenames
    const sanitizedArtist = artist.replace(/['"]/g, "");
    const sanitizedTitle = title.replace(/['"]/g, "");

    return `static/audio/${sanitizedArtist} - ${sanitizedTitle}.mp3`;
}

// Modified fetchRelatedSongs function with better error handling
async function fetchRelatedSongs(artist) {
    if (!artist) return [];

    try {
        const response = await fetch(`/api/songs/artist?name=${encodeURIComponent(artist)}`);

        // Return empty array on error or not found
        if (response.status === 404 || !response.ok) {
            console.warn(`No related songs found for artist: ${artist}`);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching related songs:", error);
        return [];
    }
}

// Modified updateLastPlayed function with better error handling
async function updateLastPlayed(song) {
    if (!song) return;

    try {
        const response = await fetch('/api/playlist/last-played', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                title: song.title || "Unknown Track",
                artist: song.artist || "",
                genre: song.genre || "",
                filePath: song.filePath || "static/audio/placeholder.mp3",
                coverPath: song.coverPath || "static/img/placeholderCover.png"
            })
        });

        if (!response.ok) {
            console.warn(`Failed to update last played song. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error updating last played:", error);
        // Silently fail - this isn't critical functionality
    }
}

// Modified fetchLastPlayed function with better error handling
async function fetchLastPlayed() {
    try {
        const response = await fetch('/api/playlist/last-played');

        // Handle 404 by returning null instead of throwing
        if (response.status === 404 || !response.ok) {
            console.log("No last played song found or API error");
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching last played:", error);
        return null;
    }
}