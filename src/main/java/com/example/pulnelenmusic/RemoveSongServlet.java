package com.example.pulnelenmusic;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/removeSong")
public class RemoveSongServlet extends HttpServlet {
    private static final String PLAYLIST_FILE = "C:\\\\playlists.txt";
    private final PlaylistManager playlistManager = new PlaylistManager(PLAYLIST_FILE);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String user     = (String) req.getSession().getAttribute("user");
        String playlist = req.getParameter("playlist");
        String title    = req.getParameter("title");
        playlistManager.removeSongFromPlaylist(user, playlist, title);
        resp.sendRedirect(req.getContextPath() + "/playlist-servlet?name=" + playlist);
    }
}
