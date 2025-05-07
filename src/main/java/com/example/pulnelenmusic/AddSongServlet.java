package com.example.pulnelenmusic;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/addSong")
public class AddSongServlet extends HttpServlet {
    private static final String PLAYLIST_FILE = "C:\\\\playlists.txt";
    private final PlaylistManager playlistManager = new PlaylistManager(PLAYLIST_FILE);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String user = (String) req.getSession().getAttribute("user");
        String playlist = req.getParameter("playlist");
        Song song = new Song(
                req.getParameter("title"),
                req.getParameter("artist"),
                req.getParameter("genre")
        );
        playlistManager.addSongToPlaylist(user, playlist, song);
        resp.sendRedirect(req.getContextPath() + "/playlist-servlet?name=" + playlist);
    }
}
