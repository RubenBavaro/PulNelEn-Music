package com.example.pulnelenmusic;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet(name = "SongAPIServlet", urlPatterns = {"/api/song", "/api/songs/artist"})
public class SongAPIServlet extends HttpServlet {
    private static final String PLAYLIST_FILE = "C:\\\\playlists.txt";
    private final PlaylistManager playlistManager = new PlaylistManager(PLAYLIST_FILE);
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Set response content type
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String pathInfo = request.getServletPath();

            if ("/api/song".equals(pathInfo)) {
                // Handle single song lookup
                String title = request.getParameter("title");
                if (title == null || title.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.println("{\"error\":\"Missing required parameter: title\"}");
                    return;
                }

                Song song = findSongByTitle(title);
                if (song != null) {
                    out.println(gson.toJson(song));
                } else {
                    // Create a placeholder song
                    Song placeholder = new Song(title, "Unknown Artist", "Unknown");
                    placeholder.setFilePath("static/audio/placeholder.mp3");
                    placeholder.setCoverPath("static/img/placeholderCover.png");
                    out.println(gson.toJson(placeholder));
                }
            } else if ("/api/songs/artist".equals(pathInfo)) {
                // Handle artist songs lookup
                String artist = request.getParameter("name");
                if (artist == null || artist.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.println("{\"error\":\"Missing required parameter: name\"}");
                    return;
                }

                List<Song> artistSongs = findSongsByArtist(artist);
                out.println(gson.toJson(artistSongs));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.println("{\"error\":\"API endpoint not found\"}");
            }

        } catch (Exception e) {
            // Log the error
            getServletContext().log("Error in Song API", e);

            // Send error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // Find a song by title from all playlists
    private Song findSongByTitle(String title) throws IOException {
        // Get all playlists
        List<Playlist> allPlaylists = getAllPlaylists();

        // Search for song in all playlists
        for (Playlist playlist : allPlaylists) {
            for (Song song : playlist.getSongs()) {
                if (song.getTitle().equalsIgnoreCase(title)) {
                    return song;
                }
            }
        }

        return null;
    }

    // Find all songs by an artist
    private List<Song> findSongsByArtist(String artist) throws IOException {
        List<Song> result = new ArrayList<>();

        // Get all playlists
        List<Playlist> allPlaylists = getAllPlaylists();

        // Search for songs in all playlists
        for (Playlist playlist : allPlaylists) {
            for (Song song : playlist.getSongs()) {
                if (song.getArtist() != null && song.getArtist().equalsIgnoreCase(artist)) {
                    // Check if song is already in result list
                    boolean exists = false;
                    for (Song existingSong : result) {
                        if (existingSong.getTitle().equalsIgnoreCase(song.getTitle())) {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        result.add(song);
                    }
                }
            }
        }

        return result;
    }

    // Helper method to get all playlists
    private List<Playlist> getAllPlaylists() throws IOException {
        // This is a simplification. In a real application, you'd want to cache this data
        List<Playlist> allPlaylists = new ArrayList<>();

        // Read playlist file and parse all playlists
        List<String> lines = java.nio.file.Files.readAllLines(java.nio.file.Paths.get(PLAYLIST_FILE));
        for (String line : lines) {
            if (!line.trim().isEmpty()) {
                Playlist playlist = Playlist.fromRecord(line);
                allPlaylists.add(playlist);
            }
        }

        return allPlaylists;
    }
}