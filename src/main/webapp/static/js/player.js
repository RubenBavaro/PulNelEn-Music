document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio player and controls
    let flag = 0;
    let currentIndex = 0;
    let playlist = [];

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
    audio.addEventListener("timeupdate", updateProgressTime);

    // Play/Pause button
    playPauseBtn.addEventListener("click", () => {
        if (audio.readyState < 2) {
            // Audio not loaded yet, use placeholder
            audio.src = "static/audio/placeholder.mp3";
        }

        if (audio.paused) {
            audio.play().catch(err => {
                console.error("Error playing audio:", err);
                // If there's an error, try playing the placeholder
                audio.src = "static/audio/placeholder.mp3";
                audio.play();
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
});

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Update time displays
function updateProgressTime() {
    const audio = document.getElementById("audioPlayer");
    const actualTimeEl = document.querySelector(".actualTime");
    const fullTimeEl = document.querySelector(".fullTime");

    if (!audio) return;

    // Always update current time
    if (actualTimeEl) {
        actualTimeEl.textContent = formatTime(audio.currentTime);
    }

    // Update duration if available and not already set
    if (fullTimeEl && !isNaN(audio.duration)) {
        fullTimeEl.textContent = formatTime(audio.duration);
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
    if (actualTimeEl) actualTimeEl.textContent = "0:00";
    if (fullTimeEl) fullTimeEl.textContent = "0:00";

    // Load audio
    const wasPlaying = !audio.paused;

    // Create the proper file path based on artist and title
    let filePath = song.filePath;

    // If filePath doesn't exist or is placeholder, try to construct one
    if (!filePath || filePath === "static/audio/placeholder.mp3") {
        if (song.artist && song.title) {
            filePath = `static/audio/${song.artist} - ${song.title}.mp3`;
        }
    }

    audio.src = filePath;

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
                // If there's an error with the constructed path, try a fallback
                audio.src = "static/audio/placeholder.mp3";
                audio.play().catch((err2) => {
                    console.error("Error playing fallback audio:", err2);
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

// Fetch song details from server
async function fetchSongDetails(songTitle) {
    try {
        // Handle song titles that might include artist information
        let title = songTitle;
        let artist = "Unknown Artist";
        let genre = "Unknown";

        // Check if the title contains artist information (e.g., "OLLY - Balorda Nostalgia")
        if (songTitle.includes(" - ")) {
            const parts = songTitle.split(" - ");
            artist = parts[0].trim();
            title = parts[1].trim();
        }

        // Remove file extension if present (e.g., .mp3)
        title = title.replace(/\.(mp3|wav|ogg|m4a)$/i, "");

        const response = await fetch(`/api/song?title=${encodeURIComponent(title)}`);

        // If API call succeeds
        if (response.ok) {
            const data = await response.json();
            return data;
        }

        // API call failed, use parsed information with appropriate fallbacks
        console.warn(`Song details not found for: ${songTitle}, using parsed information with fallbacks`);

        // For known examples, provide more accurate details
        // 1) Your known‑songs lookup, with corrected artist names:
        const knownSongs = {
            "olly|balorda nostalgia": {
                title: "Balorda Nostalgia",
                artist: "OLLY",
                genre: "Power ballad pop",
                coverFile: "coverSong1.png"
            },
            "fedez|battito": {
                title: "Battito",
                artist: "Fedez",
                genre: "Pop",
                coverFile: "coverSong2.png"
            },
            "giorgia|la cura per me": {
                title: "La cura per me",
                artist: "Giorgia",
                genre: "Pop",
                coverFile: "coverSong3.png"
            },
            "the kolors|un ragazzo una ragazza": {
                title: "Un ragazzo una ragazza",
                artist: "The Kolors",
                genre: "Pop",
                coverFile: "coverSong4.png"
            },
            "tony effe|damme una mano": {
                title: "Damme una mano",
                artist: "Tony Effe",
                genre: "Pop",
                coverFile: "coverSong5.png"
            }
        };

// 2) Normalization helper
        function normalize(str) {
            return str.trim().toLowerCase();
        }

// 3) Parse filename → { artist, title }
        function parseFilename(filename) {
            // Strip extension
            let base = filename.replace(/\.mp3$/i, "");
            // Replace underscores or multiple hyphens with a single space‑hyphen‑space
            base = base
                .replace(/[_]+/g, " ")
                .replace(/-{2,}/g, "-");

            // Split on the first ' - ' (allowing inconsistent spacing)
            const [rawArtist, ...rest] = base.split(/\s*-\s*/);
            const rawTitle = rest.join(" - ");

            return {
                artist: rawArtist.trim(),
                title:  rawTitle.trim()
            };
        }

// 4) Lookup + build full metadata
        function getSongInfo(title, artist) {
            const key = `${normalize(artist)}|${normalize(title)}`;
            const info = knownSongs[key];

            if (info) {
                return {
                    title:    info.title,
                    artist:   info.artist,
                    genre:    info.genre,
                    filePath: `static/audio/${info.artist} - ${info.title}.mp3`,
                    coverPath:`static/img/${info.coverFile}`
                };
            }

            // generic fallback
            return {
                title,
                artist,
                genre:    "Unknown",
                filePath: `static/audio/${artist} - ${title}.mp3`,
                coverPath:"static/img/defaultCover.png"
            };
        }

// 5) Convenience: from filename directly
        function getSongInfoFromFilename(filename) {
            const { artist, title } = parseFilename(filename);
            return getSongInfo(title, artist);
        }

// --- Usage example ---
        const files = [
            "Fedez - BATTITO.mp3",
            "Giorgia - LA CURA PER ME.mp3",
            "The Kolors - UN RAGAZZO UNA RAGAZZA.mp3",
            "Tony-Effe-DAMME-_NA-MANO.mp3"
        ];

        files.forEach(fn => {
            console.log( getSongInfoFromFilename(fn) );
        });


        // For other cases, use the parsed information with default paths
        return {
            title: title,
            artist: artist,
            genre: genre,
            filePath: `static/audio/${artist} - ${title}.mp3`,
            coverPath: "static/img/coverSong1.png" // Default to a known existing cover
        };
    } catch (error) {
        console.error("Error fetching song details:", error);

        // Extract artist and title if possible
        let title = songTitle;
        let artist = "Unknown Artist";

        if (songTitle.includes(" - ")) {
            const parts = songTitle.split(" - ");
            artist = parts[0].trim();
            title = parts[1].trim().replace(/\.(mp3|wav|ogg|m4a)$/i, "");
        }

        // Return default song object with the best information we have
        return {
            title: title,
            artist: artist,
            genre: "Unknown",
            filePath: `static/audio/${artist} - ${title}.mp3`,
            coverPath: "static/img/coverSong1.png"
        };
    }
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