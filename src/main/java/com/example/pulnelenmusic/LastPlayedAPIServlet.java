package com.example.pulnelenmusic;

import java.io.IOException;
import java.io.PrintWriter;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet(name = "LastPlayedAPIServlet", value = "/api/playlist/last-played")
public class LastPlayedAPIServlet extends HttpServlet {
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
            // Get user from session
            String user = (String) request.getSession().getAttribute("user");
            if (user == null || user.isEmpty()) {
                user = "guest"; // Default user if not logged in
            }

            // Get last played song
            Song lastPlayed = playlistManager.getLastPlayed(user);

            if (lastPlayed != null) {
                // Convert to JSON and send response
                out.println(gson.toJson(lastPlayed));
            } else {
                // No last played song found
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.println("{\"error\":\"No last played song found\"}");
            }

        } catch (Exception e) {
            // Log the error
            getServletContext().log("Error getting last played song", e);

            // Send error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Set response content type
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Get user from session
            String user = (String) request.getSession().getAttribute("user");
            if (user == null || user.isEmpty()) {
                user = "guest"; // Default user if not logged in
            }

            // Get parameters
            String title = request.getParameter("title");
            String artist = request.getParameter("artist");
            String genre = request.getParameter("genre");
            String filePath = request.getParameter("filePath");
            String coverPath = request.getParameter("coverPath");

            // Validate required fields
            if (title == null || title.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"error\":\"Missing required parameter: title\"}");
                return;
            }

            // Create song object
            Song song = new Song(title, artist, genre);
            song.setFilePath(filePath);
            song.setCoverPath(coverPath);

            // Update last played
            playlistManager.updateLastPlayed(user, song);

            // Send success response
            out.println("{\"success\":true}");

        } catch (Exception e) {
            // Log the error
            getServletContext().log("Error updating last played song", e);

            // Send error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}