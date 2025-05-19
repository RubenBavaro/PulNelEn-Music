package com.example.pulnelenmusic;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet(name = "RemoveSongServlet", value = "/removeSong")
public class RemoveSongServlet extends HttpServlet {
    private static final String PLAYLIST_FILE = "C:\\\\playlists.txt";
    private final PlaylistManager playlistManager = new PlaylistManager(PLAYLIST_FILE);

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Set response content type
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Get parameters
            String user = (String) request.getSession().getAttribute("user");
            String playlistName = request.getParameter("name");
            String songTitle = request.getParameter("song");

            // Input validation
            if (user == null || user.isEmpty()) {
                user = "guest"; // Default user if not logged in
            }

            if (playlistName == null || playlistName.isEmpty() || songTitle == null || songTitle.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("Missing required parameters: playlist name or song title");
                return;
            }

            // Remove the song
            playlistManager.removeSongFromPlaylist(user, playlistName, songTitle);

            // Return success message
            out.println("Song '" + songTitle + "' successfully removed from playlist '" + playlistName + "'");

        } catch (Exception e) {
            // Log the error
            getServletContext().log("Error removing song", e);

            // Send error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("Error removing song: " + e.getMessage());
        }
    }
}